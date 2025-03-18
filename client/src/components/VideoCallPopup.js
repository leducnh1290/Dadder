import React, { useState, useEffect, useRef } from "react";
import "./VideoCallPopUp.css";

const VideoCallPopup = ({ isOpen, onClose, targetUserId, initiateCall = false, socket,enemy }) => {
    console.log("Enemy data:", enemy);
    const [localStream, setLocalStream] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const [isVideoEnabled, setIsVideoEnabled] = useState(true);
    const [isAudioEnabled, setIsAudioEnabled] = useState(true);
    const [isCallEnded, setIsCallEnded] = useState(false);

    const localVideoRef = useRef();
    const remoteVideoRef = useRef();
    const peerConnectionRef = useRef();
    const isCaller = useRef(null);
    const iceCandidatesQueue = useRef([]);
    const hasRemoteDescription = useRef(false);
    console.log("initiateCall", initiateCall);
    const servers = {
        iceServers: [
            { urls: "stun:stun.l.google.com:19302" },
            { urls: "stun:stun1.l.google.com:19302" }
        ]
    };

    const processIceCandidates = async () => {
        console.log("Processing queued ICE candidates:", iceCandidatesQueue.current.length);
        
        while (iceCandidatesQueue.current.length > 0 && hasRemoteDescription.current) {
            const candidate = iceCandidatesQueue.current.shift();
            try {
                await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(candidate));
                console.log("Successfully added queued ICE candidate");
            } catch (error) {
                console.error("Error adding queued ICE candidate:", error);
            }
        }
    };
    useEffect(() => {
        if (initiateCall !== null) { // Chỉ set khi đã chắc chắn có giá trị
          isCaller.current = initiateCall;
        }
      }, [initiateCall]);
    // Khởi tạo cuộc gọi
    useEffect(() => {
        if (isOpen && socket) {
            console.log("Call started, initializing...");
            // console.log("Is caller:", isCaller.current);
            startCall();
        }
        return () => cleanup();
    }, [isOpen, socket]);

    // Lắng nghe các sự kiện WebRTC
    useEffect(() => {
        if (!isOpen || !socket) return;

        console.log("Setting up WebRTC listeners...");

        socket.on("callAccepted", async () => {
            console.log("Call accepted, starting call...");
            if (isCaller.current) {
                await startCall();
            }
        });

        socket.on("offer", async ({ offer }) => {
            console.log("Received offer");
            if (!isCaller.current) {
                await handleOffer(offer);
            }
        });

        socket.on("answer", async ({ answer }) => {
            console.log("Received answer");
            if (isCaller.current && peerConnectionRef.current) {
                try {
                    await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(answer));
                    hasRemoteDescription.current = true;
                    await processIceCandidates();
                } catch (error) {
                    console.error("Error setting remote description:", error);
                }
            }
        });

        socket.on("candidate", async ({ candidate }) => {
            console.log("Received ICE candidate");
            
            if (!peerConnectionRef.current || !hasRemoteDescription.current) {
                console.log("Queueing ICE candidate");
                iceCandidatesQueue.current.push(candidate);
                return;
            }

            try {
                await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(candidate));
                console.log("Successfully added ICE candidate");
            } catch (error) {
                console.error("Error adding ICE candidate:", error);
                iceCandidatesQueue.current.push(candidate);
            }
        });

        socket.on("callEnded", () => {
            console.log("Call ended by other user");
            cleanup();
            onClose();
            window.location.reload();
        });

        return () => {
            socket.off("callAccepted");
            socket.off("offer");
            socket.off("answer");
            socket.off("candidate");
            socket.off("callEnded");
        };
    }, [isOpen, socket]);

    const startCall = async () => {
        try {
            console.log("Starting call...");
            setIsCallEnded(false);
            hasRemoteDescription.current = false;
            iceCandidatesQueue.current = [];

            const stream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: true
            });
            setLocalStream(stream);
            if (localVideoRef.current) {
                localVideoRef.current.srcObject = stream;
            }

            if (peerConnectionRef.current) {
                peerConnectionRef.current.close();
            }

            const peerConnection = new RTCPeerConnection(servers);
            peerConnectionRef.current = peerConnection;

            stream.getTracks().forEach(track => {
                peerConnection.addTrack(track, stream);
            });

            peerConnection.ontrack = (event) => {
                console.log("Received remote track");
                if (remoteVideoRef.current && event.streams[0]) {
                    remoteVideoRef.current.srcObject = event.streams[0];
                    setIsConnected(true);
                }
            };

            peerConnection.onicecandidate = (event) => {
                if (event.candidate) {
                    console.log("Sending ICE candidate");
                    socket.emit("candidate", {
                        targetUserId: targetUserId,
                        candidate: event.candidate
                    });
                }
            };

            peerConnection.oniceconnectionstatechange = () => {
                console.log("ICE Connection State:", peerConnection.iceConnectionState);
                if (peerConnection.iceConnectionState === 'connected') {
                    setIsConnected(true);
                } else if (peerConnection.iceConnectionState === 'disconnected') {
                    setIsConnected(false);
                }
            };

            if (isCaller.current) {
                console.log("Creating offer as caller");
                const offer = await peerConnection.createOffer({
                    offerToReceiveAudio: true,
                    offerToReceiveVideo: true
                });
                await peerConnection.setLocalDescription(offer);
                socket.emit("offer", {
                    targetUserId: targetUserId, // Gửi userId
                    offer
                });                
            }

        } catch (error) {
            console.error("Error starting call:", error);
            alert("Không thể truy cập camera hoặc microphone");
            cleanup();
            onClose();
        }
    };

    const handleOffer = async (offer) => {
        try {
            if (!peerConnectionRef.current) return;

            console.log("Setting remote description from offer");
            await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(offer));
            hasRemoteDescription.current = true;

            console.log("Creating answer");
            const answer = await peerConnectionRef.current.createAnswer();
            await peerConnectionRef.current.setLocalDescription(answer);

            socket.emit("answer", {
                targetUserId: targetUserId,
                answer
            });   

            await processIceCandidates();
        } catch (error) {
            console.error("Error handling offer:", error);
        }
    };

    const cleanup = () => {
        console.log("Cleaning up...");
        setIsCallEnded(true);

        if (peerConnectionRef.current) {
            peerConnectionRef.current.close();
            peerConnectionRef.current = null;
        }

        if (localStream) {
            localStream.getTracks().forEach(track => track.stop());
            setLocalStream(null);
        }

        if (localVideoRef.current) {
            localVideoRef.current.srcObject = null;
        }
        if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = null;
        }

        setIsConnected(false);
        setIsVideoEnabled(true);
        setIsAudioEnabled(true);
    };

    const handleEndCall = () => {
        if (isCallEnded) return;
        
        socket.emit("endCall", targetUserId);
        cleanup();
        onClose();
        window.location.reload();
    };

    const toggleVideo = () => {
        if (localStream) {
            const videoTrack = localStream.getVideoTracks()[0];
            if (videoTrack) {
                videoTrack.enabled = !videoTrack.enabled;
                setIsVideoEnabled(videoTrack.enabled);
            }
        }
    };

    const toggleAudio = () => {
        if (localStream) {
            const audioTrack = localStream.getAudioTracks()[0];
            if (audioTrack) {
                audioTrack.enabled = !audioTrack.enabled;
                setIsAudioEnabled(audioTrack.enabled);
            }
        }
    };

    if (!isOpen) return null;

    return (
        <div className="video-call-container">
            <div className="video-wrapper">
                <div className="video-box">
                    <video 
                        ref={localVideoRef} 
                        autoPlay 
                        muted 
                        playsInline 
                        className="local-video"
                    />
                    <div className="video-label">Bạn</div>
                </div>
                <div className="video-box">
                    <video 
                        ref={remoteVideoRef} 
                        autoPlay 
                        playsInline 
                        className="remote-video"
                        style={{ opacity: isConnected ? 1 : 0.5 }}
                    />
                    <div className="video-label">
                    {isConnected 
        ? (enemy && enemy.firstName ? `${enemy.firstName} ${enemy.lastName}` : "Đang kết nối...")
        : "Đang kết nối..."
    }
                    </div>
                </div>
            </div>
            <div className="controls">
                <button 
                    onClick={toggleVideo} 
                    className={`control-btn ${!isVideoEnabled ? 'disabled' : ''}`}
                >
                    {isVideoEnabled ? 'Tắt Camera' : 'Bật Camera'}
                </button>
                <button 
                    onClick={toggleAudio} 
                    className={`control-btn ${!isAudioEnabled ? 'disabled' : ''}`}
                >
                    {isAudioEnabled ? 'Tắt Mic' : 'Bật Mic'}
                </button>
                <button onClick={handleEndCall} className="end-call">
                    Kết thúc cuộc gọi
                </button>
            </div>
        </div>
    );
};

export default VideoCallPopup;

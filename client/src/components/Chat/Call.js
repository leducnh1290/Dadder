import React, { useState, useRef, useEffect } from 'react';
import io from 'socket.io-client';
import Peer from 'simple-peer';

const socket = io('http://localhost:5000'); // Kết nối với server

const Call = ({ userId }) => {
  const [stream, setStream] = useState(null);
  const [receivingCall, setReceivingCall] = useState(false);
  const [caller, setCaller] = useState('');
  const [callerSignal, setCallerSignal] = useState(null);
  const [callAccepted, setCallAccepted] = useState(false);

  const userVideo = useRef();
  const partnerVideo = useRef();
  const connectionRef = useRef();

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then(stream => {
        setStream(stream);
        if (userVideo.current) {
          userVideo.current.srcObject = stream;
        }
      });

    socket.on('callUser', (data) => {
      setReceivingCall(true);
      setCaller(data.from);
      setCallerSignal(data.signal);
    });

    return () => {
      socket.off('callUser');
    };
  }, []);

  const callUser = (id) => {
    const peer = new Peer({
      initiator: true,
      trickle: false,
      stream: stream,
    });

    peer.on('signal', (data) => {
      socket.emit('callUser', {
        userToCall: id,
        signalData: data,
        from: userId,
      });
    });

    peer.on('stream', (userStream) => {
      if (partnerVideo.current) {
        partnerVideo.current.srcObject = userStream;
      }
    });

    socket.on('callAccepted', (signal) => {
      setCallAccepted(true);
      peer.signal(signal);
    });

    connectionRef.current = peer;
  };

  const answerCall = () => {
    setCallAccepted(true);
    const peer = new Peer({
      initiator: false,
      trickle: false,
      stream: stream,
    });

    peer.on('signal', (data) => {
      socket.emit('answerCall', { signal: data, to: caller });
    });

    peer.on('stream', (userStream) => {
      if (partnerVideo.current) {
        partnerVideo.current.srcObject = userStream;
      }
    });

    peer.signal(callerSignal);
    connectionRef.current = peer;
  };

  return (
    <div>
      <h3>Video Call</h3>
      <div>
        <video ref={userVideo} autoPlay playsInline style={{ width: '300px' }} />
        {callAccepted && <video ref={partnerVideo} autoPlay playsInline style={{ width: '300px' }} />}
      </div>
      <button onClick={() => callUser('userID-cua-nguoi-nhan')}>Gọi</button>
      {receivingCall && !callAccepted && (
        <div>
          <h4>Ai đó đang gọi bạn...</h4>
          <button onClick={answerCall}>Nhận cuộc gọi</button>
        </div>
      )}
    </div>
  );
};

export default Call;

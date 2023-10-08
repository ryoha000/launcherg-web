import pako from "pako";

export const useWebRTC = () => {
  const url = new URL(window.location.href);
  const searchParams = url.searchParams;

  const id = searchParams.get("id");
  const data = searchParams.get("d");

  const hasSetting = id && data;

  const pc = new RTCPeerConnection({
    iceServers: [
      { urls: "stun:stunserver.stunprotocol.org:3478" },
      { urls: "stun:stun.l.google.com:19302" },
    ],
    iceCandidatePoolSize: 10,
  });

  pc.ondatachannel = (event) => {
    console.log("ondatachannel", event);
    const channel = event.channel;
    channel.onmessage = (event) => {
      console.log("channel message", event.data);
    };
    channel.onopen = () => {
      console.log("channel open");
    };
    channel.onclose = () => {
      console.log("channel close");
    };
  };

  const candidates: RTCIceCandidate[] = [];
  pc.onicecandidate = (event) => {
    if (event.candidate) {
      candidates.push(event.candidate);
    } else {
      console.log("candidates", candidates);

      // const answerChannel = pc.createDataChannel("answer");
      // answerChannel.onopen = (event) => {
      //   console.log("answer channel open");
      //   answerChannel.send(
      //     JSON.stringify({
      //       answer: pc.localDescription,
      //       iceCandidates: candidates,
      //     })
      //   );
      // };
    }
  };
  pc.oniceconnectionstatechange = () => {
    console.log("ICE Connection State:", pc.iceConnectionState);
  };
  pc.onconnectionstatechange = () => {
    console.log("Connection State:", pc.connectionState);
  };
  pc.onicecandidateerror = (event) => {
    console.error("ICE Candidate Error:", event);
  };

  const connect = async () => {
    if (!hasSetting) {
      return;
    }
    const raw = atob(data);
    const { offer, iceCandidates } = JSON.parse(
      pako.inflate(
        Uint8Array.from(
          // @ts-ignore
          Array.prototype.map.call(raw, (x) => {
            return x.charCodeAt(0);
          })
        ),
        { to: "string" }
      )
    ) as {
      offer: RTCSessionDescriptionInit | null;
      iceCandidates: RTCIceCandidateInit[];
    };
    if (!offer) {
      alert("共有されたデータに offer が含まれていません。");
      return;
    }

    // const memoChannel = pc.createDataChannel("memo");
    // memoChannel.onmessage = (event) => {
    //   console.log("データチャネルメッセージ取得:", event.data);
    // };
    // memoChannel.onopen = function () {
    //   memoChannel.send("hello");
    // };
    // memoChannel.onclose = function () {
    //   console.log("データチャネルのクローズ");
    // };

    await pc.setRemoteDescription(new RTCSessionDescription(offer));
    iceCandidates.forEach((candidate) => {
      pc.addIceCandidate(candidate);
    });

    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);
    console.log("answer", answer.sdp);
    console.log("offer", offer.sdp);
  };
  return { hasSetting, connect };
};

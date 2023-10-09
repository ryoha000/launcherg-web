import {
  SkyWayContext,
  SkyWayRoom,
  SkyWayStreamFactory,
  type RoomPublication,
  type LocalStream,
  type LocalDataStream,
} from "@skyway-sdk/room";
import { memo } from "../store/memo";

type PingMessage = { type: "ping" };
type MemoMessage = {
  type: "memo";
  text: string;
  gameId: number;
  base64Images: { path: string; base64: string }[];
};

type LocalMessage = PingMessage | MemoMessage;
type RemoteMessage = PingMessage | MemoMessage;

export const useSkyWay = () => {
  const url = new URL(window.location.href);
  const searchParams = url.searchParams;

  const gameIdString = searchParams.get("gameId");
  const gameId = gameIdString ? +gameIdString : 0;
  const roomIdString = searchParams.get("roomId");
  const seiyaUrl = searchParams.get("seiyaUrl");

  const hasSetting = gameIdString && roomIdString;

  const cleanupFuncs: (() => void)[] = [];
  const cleanup = () => {
    cleanupFuncs.forEach((func) => func());
  };

  let dataStream: LocalDataStream | undefined = undefined;

  const connect = async () => {
    if (!hasSetting) return;
    const { authToken }: { authToken: string } = await fetch("/connect", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
    }).then((res) => res.json());

    const context = await SkyWayContext.Create(authToken);
    const room = await SkyWayRoom.Find(
      context,
      {
        name: roomIdString,
      },
      "p2p"
    );
    const me = await room.join();
    room.publications;

    const onPublicate = async (publication: RoomPublication<LocalStream>) => {
      if (publication.publisher.id === me.id) return;
      if (publication.contentType !== "data") return;

      const { stream } = await me.subscribe(publication.id);
      if (stream.contentType !== "data") return;

      const { removeListener } = stream.onData.add((data) => {
        if (typeof data !== "string") return;

        const message: RemoteMessage = JSON.parse(data);
        switch (message.type) {
          case "ping":
            break;
          case "memo":
            if (message.gameId !== gameId) {
              console.warn("gameId is not match");
              return;
            }
            memo.set({ value: message.text, lastModified: "remote" });
            message.base64Images.forEach(({ path, base64 }) => {
              memo.appendBase64Image(path, base64);
            });
            break;
        }
      });
      cleanupFuncs.push(removeListener);
    };

    dataStream = await SkyWayStreamFactory.createDataStream();
    await me.publish(dataStream);

    room.publications.forEach(onPublicate);
    room.onStreamPublished.add((e) => onPublicate(e.publication));
  };

  const sendMessage = (message: LocalMessage) => {
    if (!dataStream) return;

    dataStream.write(JSON.stringify(message));
  };

  const syncMemo = (text: string) => {
    if (!dataStream || !hasSetting) return;

    const message: MemoMessage = {
      type: "memo",
      text,
      gameId: gameId,
      base64Images: [],
    };
    sendMessage(message);
  };

  return { hasSetting, gameId, seiyaUrl, connect, syncMemo, cleanup };
};

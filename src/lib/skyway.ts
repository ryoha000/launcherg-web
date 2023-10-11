import {
  SkyWayContext,
  SkyWayRoom,
  SkyWayStreamFactory,
  type RoomPublication,
  type LocalStream,
  type LocalDataStream,
  RemoteDataStream,
} from "@skyway-sdk/room";
import { base64ImageStore, memo } from "../store/memo";

type PingMessage = { type: "ping" };
type MemoMessage = {
  type: "memo";
  text: string;
  gameId: number;
  base64Images: { path: string; base64: string }[];
};
type InitMessage = { type: "init"; gameId: number };
type InitResponseMessage = {
  type: "init_response";
  gameId: number;
  initialMemo: MemoMessage;
};
type TakeScreenshotMessage = {
  type: "take_screenshot";
  gameId: number;
  cursorLine: number;
};

type LocalMessage =
  | PingMessage
  | MemoMessage
  | InitMessage
  | TakeScreenshotMessage;
type RemoteMessage = PingMessage | MemoMessage | InitResponseMessage;

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

    const onSubscribe = async (stream: RemoteDataStream) => {
      const { removeListener } = stream.onData.add((data) => {
        if (typeof data !== "string") return;

        const message: RemoteMessage = JSON.parse(data);
        if (message.type !== "ping") {
          console.log("receive message", message);
        }
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
              base64ImageStore.appendBase64Image(path, base64);
            });
            break;
          case "init_response":
            if (message.gameId !== gameId) {
              console.warn("gameId is not match");
              return;
            }
            memo.set({
              value: message.initialMemo.text,
              lastModified: "remote",
            });
            message.initialMemo.base64Images.forEach(({ path, base64 }) => {
              base64ImageStore.appendBase64Image(path, base64);
            });
            break;
        }
      });
      cleanupFuncs.push(removeListener);

      sendInitMessage();
    };

    dataStream = await SkyWayStreamFactory.createDataStream();
    await me.publish(dataStream);

    me.onPublicationSubscribed.add(({ stream, subscription }) => {
      if (stream.contentType === "data") {
        onSubscribe(stream);
      }
    });

    const pingTimer = setInterval(() => {
      if (!dataStream) return;
      const message: PingMessage = { type: "ping" };
      sendMessage(message);
    }, 10000);
    cleanupFuncs.push(() => clearInterval(pingTimer));
  };

  const sendMessage = (message: LocalMessage) => {
    if (!dataStream) return;
    if (message.type !== "ping") {
      console.log("send message", message);
    }

    dataStream.write(JSON.stringify(message));
  };

  const syncMemo = (text: string) => {
    if (!dataStream || !hasSetting) return;

    const message: MemoMessage = {
      type: "memo",
      text,
      gameId,
      base64Images: [],
    };
    sendMessage(message);
  };

  const sendInitMessage = () => {
    sendMessage({ type: "init", gameId });
  };

  const takeScreenshot = async (cursorLine: number) => {
    sendMessage({ type: "take_screenshot", gameId, cursorLine });
  };

  return {
    hasSetting,
    gameId,
    seiyaUrl,
    takeScreenshot,
    connect,
    syncMemo,
    cleanup,
  };
};

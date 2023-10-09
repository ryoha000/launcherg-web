import * as jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";

interface Env {
  SKYWAY_SECRET_KEY: string;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  // 環境変数からSkyWayのAPIキーを取得
  const skywaySecretKey = context.env.SKYWAY_SECRET_KEY;

  const nowInSec = Math.floor(Date.now() / 1000);
  const authToken = jwt.sign(
    {
      jti: uuidv4(),
      iat: nowInSec,
      exp: nowInSec + 60 * 60 * 24,
      scope: {
        app: {
          id: "9960184c-9a47-4935-88cb-5cea841bb611",
          turn: true,
          actions: ["read"],
          channels: [
            {
              id: "*",
              name: "*",
              actions: ["write"],
              members: [
                {
                  id: "*",
                  name: "*",
                  actions: ["write"],
                  publication: {
                    actions: ["write"],
                  },
                  subscription: {
                    actions: ["write"],
                  },
                },
              ],
              sfuBots: [
                {
                  actions: ["write"],
                  forwardings: [
                    {
                      actions: ["write"],
                    },
                  ],
                },
              ],
            },
          ],
        },
      },
    },
    skywaySecretKey
  );

  return new Response(JSON.stringify({ authToken }), {
    headers: {
      "content-type": "application/json",
    },
    status: 200,
  });
};

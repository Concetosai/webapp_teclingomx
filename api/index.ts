import serverless from "serverless-http";
import { createApp } from "../server";

let cachedHandler: any;

async function getHandler() {
  if (!cachedHandler) {
    const app = await createApp();
    cachedHandler = serverless(app);
  }
  return cachedHandler;
}

export default async function route(req: any, res: any) {
  const handler = await getHandler();
  return handler(req, res);
}

export const config = {
  maxDuration: 30,
};

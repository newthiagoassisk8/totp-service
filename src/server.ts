import { createServer } from 'node:http';
import {
  createApp,
  defineEventHandler,
  getQuery,
  handleCors,
  readBody,
  toNodeListener,
} from 'h3';
import { TOTP } from 'totp-generator';

const TOTPKeys: Record<string, any> = {
  item1: {
    label: 'Demo 1 - 1 digitos',
    icon: null,
    key: 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
    opts: { digits: 6, period: 30 },
  },
  item2: {
    label: 'Demo 2 - 8 digitos',
    icon: null,
    key: 'JBSWY3DPEHPK3PXP',
    opts: { digits: 6, algorithm: 'SHA-256', period: 30 },
  },
};

async function getCode(uid: string) {
  const TOTPData = TOTPKeys[uid];
  if (!TOTPData) return null;

  const { otp, expires } = await TOTP.generate(TOTPData.key, TOTPData.opts);
  return {
    uid,
    label: TOTPData.label,
    otp,
    expires,
    now: new Date().getTime(),
    expiresDate: new Date(expires),
    digits: TOTPData.opts.digits,
  };
}

const app = createApp();

app.use(
  defineEventHandler((event) => {
    const didHandle = handleCors(event, {
      origin: '*',
      methods: ['GET', 'PATCH', 'PUT', 'OPTIONS'],
      preflight: {
        statusCode: 204,
      },
    });

    if (didHandle) {
      return '';
    }
  })
);

app.use(
  '/api/totp',
  defineEventHandler(async (event) => {
    const { uid } = getQuery(event);

    if (event.node.req.method === 'PATCH' || event.node.req.method === 'PUT') {
      const body = await readBody(event);
      const bodyUid = body?.uid;
      const bodyLabel = body?.label;
      const bodyDigits = body?.digits;

      if (!bodyUid || typeof bodyUid !== 'string') {
        event.node.res.statusCode = 400;
        return { error: 'uid is required' };
      }

      const item = TOTPKeys[bodyUid];
      if (!item) {
        event.node.res.statusCode = 404;
        return { error: 'uid not found' };
      }

      let updated = false;

      if (bodyLabel !== undefined) {
        if (typeof bodyLabel !== 'string' || bodyLabel.trim().length === 0) {
          event.node.res.statusCode = 400;
          return { error: 'label must be a non-empty string' };
        }
        item.label = bodyLabel;
        updated = true;
      }

      if (bodyDigits !== undefined) {
        const digitsNumber = Number(bodyDigits);
        if (!Number.isInteger(digitsNumber) || digitsNumber <= 0) {
          event.node.res.statusCode = 400;
          return { error: 'digits must be a positive integer' };
        }
        item.opts = { ...item.opts, digits: digitsNumber };
        updated = true;
      }

      if (!updated) {
        event.node.res.statusCode = 400;
        return { error: 'no updatable fields provided' };
      }

      return getCode(bodyUid);
    }

    if (uid) {
      return getCode(uid as string);
    }

    const codes = await Promise.all(
      Object.keys(TOTPKeys).map((id) => getCode(id))
    );
    return codes;
  })
);

const port = Number(process.env.PORT ?? 3001);
const host = process.env.HOST ?? '0.0.0.0';
createServer(toNodeListener(app)).listen(port, host, () => {
  console.log(`TOTP service listening on http://${host}:${port}`);
});

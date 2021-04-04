import { NextApiRequest, NextApiResponse } from 'next';

/** aws eb 에서 healthCheck 호출용 */
const handler = (_req: NextApiRequest, res: NextApiResponse) => {
  res.status(200).send('200');
};

export default handler;

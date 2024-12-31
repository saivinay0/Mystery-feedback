import { UserModel } from '@/model/User';
import { getServerSession } from 'next-auth/next';
import dbConnect from '@/lib/dbConnect';
import { User } from 'next-auth';

import { authOptions } from '../../auth/[...nextauth]/options';
import { NextApiRequest, NextApiResponse } from 'next';

export async function DELETE(
  request: NextApiRequest,
  response: NextApiResponse
) {
  // Extract messageid from request.query
  const { messageid } = request.query;

  if (typeof messageid !== 'string') {
    return response.status(400).json({
      success: false,
      message: 'Invalid message ID'
    });
  }

  await dbConnect();
  const session = await getServerSession(authOptions);
  const _user: User = session?.user;

  if (!session || !_user) {
    return response.status(401).json({
      success: false,
      message: 'Not authenticated'
    });
  }

  try {
    const updateResult = await UserModel.updateOne(
      { _id: _user._id },
      { $pull: { messages: { _id: messageid } } }
    );

    if (updateResult.modifiedCount === 0) {
      return response.status(404).json({
        message: 'Message not found or already deleted',
        success: false
      });
    }

    return response.status(200).json({
      message: 'Message deleted',
      success: true
    });
  } catch (error) {
    console.error('Error deleting message:', error);
    return response.status(500).json({
      message: 'Error deleting message',
      success: false
    });
  }
}

import { Server } from '../models/server.js';
import { ObjectId } from 'mongodb';
import { getVoiceChannelParticipants } from '../socket/channelServer.js';

export const createServer = async (req, res) => {
  const { name, members } = req.body;
  const { user } = req;
  const ownerId = ObjectId.createFromHexString(user._id);

  if (members.length === 0) {
    return res.status(400).json({ message: 'At least one member is required' });
  }

  const membersObjectId = members.map((member) =>
    ObjectId.createFromHexString(member)
  );

  try {
    const server = await Server.create({
      name,
      owner: ownerId,
      members: [ownerId, ...membersObjectId],
    });

    res.status(201).json(server);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const getServers = async (req, res) => {
  const { user } = req;
  const userId = ObjectId.createFromHexString(user._id);
  try {
    const servers = await Server.find({ members: { $in: [userId] } })
      .populate('owner', 'username email')
      .populate('members', 'username email');

    const serversData = servers.map((server) => ({
      ...server.toObject(),
      voiceChannel: getVoiceChannelParticipants(server._id.toString()), // To do: should return the members currently inside the server's voice channel
    }));

    res.status(200).json(serversData);
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error' });
  }
};

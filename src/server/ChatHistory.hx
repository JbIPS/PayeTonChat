package server;

import js.npm.mongoose.macro.Manager;
import js.npm.mongoose.macro.Model;

typedef ChatHistoryData = {
	username: String,
	message: String,
	?whisperTarget: String
}



class ChatHistory extends Model<ChatHistoryData>{}
class ChatHistoryManager extends Manager<ChatHistoryData, ChatHistory>{}
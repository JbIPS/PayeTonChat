package server;

import js.npm.mongoose.macro.Manager;
import js.npm.mongoose.macro.Model;

typedef ChatHistoryData = {
	var username: String;
	var message: String;
}



class ChatHistory extends Model<ChatHistoryData>{}
class ChatHistoryManager extends Manager<ChatHistoryData, ChatHistory>{}
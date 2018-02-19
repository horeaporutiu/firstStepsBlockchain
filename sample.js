/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * Sample transaction processor function.
 * @param {org.acme.sample.SendMessage} tx The send message instance.
 * @transaction
 */
function sendMessage(tx) {
  var NS = 'org.acme.sample';
  
  if (tx.value.length <= 0) {
    throw new Error('WHAT ARE YOU SAYING!?');
  }
  
  //first check if transaction user is a registered user
  return getParticipantRegistry('org.acme.sample.User')
  .then(function (participantRegistry) {
    // Determine if the specific user exists in the participant registry.
    return participantRegistry.exists(tx.chatUser.facebookId);
  })
  .then(function (exists) {
    
    if (exists) {
        console.log('User exists');
      var messageId = Math.random().toString(36).substring(3);
      
      var message = getFactory().newResource(NS,
       'Message', messageId);
      
      var dateStr = new Date();
      dateStr = dateStr.toString();

      message.value = tx.value;
      message.chatUser = tx.chatUser;
      message.messageId = messageId;
      message.timeStamp = dateStr;
      //What cost me hours on hours;
      if(!message.chatUser.messages) {
        message.chatUser.messages = [];
      }
      //add messageId to array of messages for a user
      message.chatUser.messages.push(messageId);
      
      
      return getAssetRegistry('org.acme.sample.Message')
        .then(function(messageAssetRegistry){
          return messageAssetRegistry.add(message);
        }).then(function(){
      		return getParticipantRegistry('org.acme.sample.User')
            .then(function (participantRegistry) {
              return participantRegistry.update(tx.chatUser);
            })
      	})
    } else {
    	throw new Error('Oh no! HES AN IMPOSTOR!');
    }
  })
}
/**
 * Sample transaction processor function.
 * @param {org.acme.sample.getUserMessages} facebookId The Id of the user that we want to get messages from.
 * @transaction
 */
/**
 * Sample transaction processor function.
 * @param {org.acme.sample.getUserMessages} facebookId The Id of the user that we want to get messages from.
 * @transaction
 */
function getUserMessages(userId) {
  var userRegistry = null;
  return getParticipantRegistry('org.acme.sample.User')
    .then(function (participantRegistry) {
      // Determine if the specific user exists in the participant registry.
      return participantRegistry.get(userId.facebookId);
    }).then(function (user) {
      userRegistry = user
      return getAssetRegistry('org.acme.sample.Message');
    }).then(function (messageRegistry) {
      var promises = [];
      for (var i = 0; i < userRegistry.messages.length; i++) {
        var promise = messageRegistry.get(userRegistry.messages[i]).then(function (result) { return result.value })
          .catch(function (err) {
            throw err;
          });
        promises.push(promise);
      }
      return Promise.all(promises);
    }).then(function (userMessages) {
      var allMessages = getFactory().newEvent('org.acme.sample', 'ShowMessages');
      allMessages.messages = userMessages;
      emit(allMessages);
      return userMessages
    });
}
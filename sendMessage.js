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


function SendMessage(tx) {
    
    var NS = 'org.acme.sample';
  
    var message = getFactory().newResource(NS, 'Message', Math.random().toString(36).substring(3));

    message.value = tx.message;
    message.chatUser = tx.chatUser;
    
    console.log('right before return getAssetReg');
    
    return getAssetRegistry(NS + '.Message').then(function(registry) {
      console.log('right after return getAssetReg');
      return registry.add(message);
    })
    .then(function(assetRegistry) {
    return assetRegistry.update(tx.message);
    }).then(function () {
      // Emit an event for the modified asset.
      var event = getFactory().newEvent('org.acme.sample', 'ShowChat');
      event.message = tx.message;
        event.messageText = tx.message.value;
      emit(event);
    });
  
  }
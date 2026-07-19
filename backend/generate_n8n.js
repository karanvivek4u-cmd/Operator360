const fs = require('fs');
const path = require('path');

const workflow = {
  "name": "Operator360 Notifications (Ultra Simple)",
  "nodes": [
    {
      "parameters": {
        "httpMethod": "POST",
        "path": "operator360-notifications",
        "options": {}
      },
      "id": "webhook_node",
      "name": "Webhook",
      "type": "n8n-nodes-base.webhook",
      "typeVersion": 1,
      "position": [ 100, 300 ],
      "webhookId": "operator360-notifications"
    },
    {
      "parameters": {
        "resource": "message",
        "operation": "send",
        "sendTo": "={{$json.body.recipient}}",
        "subject": "={{$json.body.subject}}",
        "emailType": "html",
        "message": "={{$json.body.message}}",
        "appendAttribution": false,
        "options": {
          "appendAttribution": false
        }
      },
      "id": "gmail_node",
      "name": "Gmail",
      "type": "n8n-nodes-base.gmail",
      "typeVersion": 2.1,
      "position": [ 360, 300 ],
      "credentials": {
        "gmailOAuth2": {
          "id": "",
          "name": "Gmail account"
        }
      }
    }
  ],
  "connections": {
    "Webhook": {
      "main": [
        [
          {
            "node": "Gmail",
            "type": "main",
            "index": 0
          }
        ]
      ]
    }
  },
  "active": false,
  "settings": {}
};

fs.writeFileSync(path.join(__dirname, 'n8n/operator360_workflow.json'), JSON.stringify(workflow, null, 2));
console.log("Generated ultra-simple 2-node n8n workflow.");

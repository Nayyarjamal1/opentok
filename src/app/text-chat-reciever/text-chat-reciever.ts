import { Component, OnInit, AfterViewInit} from '@angular/core';
import { GlobalService } from '../GlobalService';

declare var $: any;
declare var OT: any;


@Component({
    selector: 'app-text-chat-reciever',
    templateUrl: './text-chat-reciever.html',
    styleUrls: ['./text-chat-reciever.css']
})
export class ReceiverComponent implements OnInit {

    apiKey: any;
    sessionId: any;
    token: any;
    session: any;
    message: any;
    stream: any;

    constructor(private base_path_service: GlobalService) {
    }

    ngOnInit() {
        this.textChat();
    }

    textChat() {
        var url = this.base_path_service.base_path + 'session/?id=3';
        this.base_path_service.GetRequest(url)
            .subscribe(res => {
                this.apiKey = res[0].json.apiKey;
                this.sessionId = res[0].json.sessionId;
                this.token = res[0].json.token;

                this.session = OT.initSession(this.apiKey, this.sessionId);

                this.session.on('sessionConnected', (event) => {
                    console.log("I'm connected")
                })

                this.session.on('signal:receiver', (event) => {
                    console.log(event, "gsffee")
                    var msg = document.createElement('p');
                    msg.innerHTML = event.data;
                    msg.className = event.from.connectionId === this.session.connection.connectionId ? 'mine' : 'theirs';
                    var msgHistory = document.getElementById('history')
                    msgHistory.appendChild(msg);
                    msg.scrollIntoView();
                });

                this.session.on("signal", (event) => {
                    console.log(event, "Signal sent from connection ");
                    // Process the event.data property, if there is any data.
                });

                this.session.connect(this.token, (error) => {
                    console.log(error, "connection error")
                })
            })
    }

    sendMessage(value) {
        var mymsg = document.createElement('p');
        mymsg.innerHTML = value;
        var msgHistory = document.getElementById('history')
        msgHistory.appendChild(mymsg);
        mymsg.scrollIntoView();

        console.log(value, "dataaaa")
        this.session.signal({
            type: 'sender',
            data: value
        }, function (error) {
            if (!error) {
                value = '';
            }
        });
    }
}

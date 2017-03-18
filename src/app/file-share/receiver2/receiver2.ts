import { Component, OnInit, AfterViewInit} from '@angular/core';
import { GlobalService } from '../../GlobalService';

declare var $: any;
declare var OT: any;


@Component({
    selector: 'app-receiver2',
    templateUrl: './receiver2.html',
    styleUrls: ['./receiver2.css']
})
export class FileReceiver2Component implements OnInit {

    apiKey: any;
    sessionId: any;
    token: any;
    session: any; receiver
    message: any;
    stream: any;
    image: any;
    imageName: any;
    id: any;
    imageFlag = 0;

    constructor(private base_path_service: GlobalService) {
    }

    ngOnInit() {
        this.textChat();
    }

    fileChangeEvent(fileInput: any) {

        this.image = fileInput.target.files[0];

        if (this.image != undefined) {
            this.imageFlag = 1;
            this.imageName = this.image.name;
            if (FileReader != undefined) {
                var reader = new FileReader();
                reader.addEventListener("load", function () {
                    console.log(reader);
                }, false);
                if (this.image) {
                    reader.readAsDataURL(this.image);
                }
            }
        } else {

        }
    }

    textChat() {
        this.id = 3;
        var url = this.base_path_service.base_path + 'session/?id=1';
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
                    var msg = document.createElement('img');
                    msg.setAttribute('src', event.data);
                    // var msgHistory = document.getElementById('history')
                    // var msg = document.createElement('p');
                    // msg.innerHTML = event.data;
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

    sendFile() {
        this.imageFlag = 0;

        var url = this.base_path_service.base_path + 'upload/';
        return new Promise((resolve, reject) => {
            var formData: any = new FormData();
            var xhr = new XMLHttpRequest();

            formData.append("id", this.id);
            formData.append("file", this.image);

            xhr.onreadystatechange = () => {
                if (xhr.readyState == 4) {
                    
                    console.log(JSON.parse(xhr.response).file, 'success')                    
                    
                    var mymsg = document.createElement('img');
                    mymsg.setAttribute('src', this.base_path_service.base_path + JSON.parse(xhr.response).file);
                    var msgHistory = document.getElementById('history')
                    msgHistory.appendChild(mymsg);
                    mymsg.scrollIntoView();
                    
                    this.session.signal({
                        type: 'sender',
                        data: this.base_path_service.base_path + JSON.parse(xhr.response).file
                    }, function (error) {
                        if (!error) {
                            console.log('error')
                        }
                    });
                }
            }
            xhr.open("POST", url, true);
            xhr.send(formData);
        });
    }
}

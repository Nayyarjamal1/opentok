import { Component, OnInit, AfterViewInit} from '@angular/core';
import { GlobalService } from '../../GlobalService';

declare var $: any;
declare var OT: any;


@Component({
    selector: 'app-sender',
    templateUrl: './sender.html',
    styleUrls: ['./sender.css']
})
export class FileSenderComponent implements OnInit {

    apiKey: any;
    sessionId: any;
    token: any;
    session: any;
    message: any;
    stream: any;
    image: any;
    imageName: any;
    id: any;
    imageFlag = 0;
    showfileSection: boolean = false;
    userList:any;

    constructor(private base_path_service: GlobalService) {
    }

    ngOnInit() {
        this.getUserList();
    }

    getUserList() {
        var url = this.base_path_service.base_path + 'doc/';
        this.base_path_service.GetRequest(url)
            .subscribe(res => {
                console.log(res[0].json, "resssssss");
                this.userList = res[0].json;                
            })
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

    sendFileSection(id) {
        this.id = id;
        var url = this.base_path_service.base_path + 'session/?id=3';
        this.base_path_service.GetRequest(url)
            .subscribe(res => {
                this.apiKey = res[0].json.apiKey;
                this.sessionId = res[0].json.sessionId;
                this.token = res[0].json.token;

                this.session = OT.initSession(this.apiKey, this.sessionId);

                this.session.on('sessionConnected', (event) => {
                    console.log("I'm connected")
                    this.showfileSection = true;
                })

                this.session.on('signal:sender', (event) => {
                    console.log(event, "gsffee")
                    // var msg = document.createElement('p');
                    // msg.innerHTML = event.data;
                    var msg = document.createElement('img');
                    msg.setAttribute('src', event.data);
                    msg.className = event.from.connectionId === this.session.connection.connectionId ? 'mine' : 'theirs';
                    var msgHistory = document.getElementById('history')
                    msgHistory.appendChild(msg);
                    msg.scrollIntoView();
                });

                this.session.on("signal", (event) => {
                    console.log(event, "Signal sent from connection ");
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
                        type: 'receiver',
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

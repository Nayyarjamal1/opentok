import { Component, OnInit, AfterViewInit} from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms'
import { Router, ActivatedRoute } from '@angular/router'
import { GlobalService } from '../../GlobalService';

declare var $: any;
declare var OT: any;
declare var ReconnectingWebSocket: any;


@Component({
    selector: 'app-receiver',
    templateUrl: './receiver.html',
    styleUrls: ['./receiver.css']
})
export class ReceiverDemoComponent implements OnInit {

    message: any;
    id: any;
    userList: any;
    socket: any;
    msg: any;
    receiverForm: FormGroup;

    constructor(private base_path_service: GlobalService, private route: ActivatedRoute,
        private router: Router, private fb: FormBuilder) {
    }

    ngOnInit() {
        this.route.params.subscribe(param => {
            console.log(param)
            this.id = param['id'];
        })

        this.receiverForm = this.fb.group({
            'message': ['', [Validators.required]]
        })

        this.getUserList();
        this.getUserInfo();
    }

    getUserList() {
        var url = this.base_path_service.base_path + 'doc/';
        this.base_path_service.GetRequest(url)
            .subscribe(res => {
                console.log(res[0].json, "resssssss");
                this.userList = res[0].json;
            })
    }

    getUserInfo() {

        var url = this.base_path_service.base_path_chat + '1/' + this.id + '/';
        this.socket = new ReconnectingWebSocket(url);
        this.socket.onmessage = (message) => {
            console.log("response after 1: ", JSON.parse(message.data))
            this.msg = message;
            if (JSON.parse(message.data).person == this.id) {
                console.log('HEYY connected')
                var group = JSON.parse(this.msg.data).group_name;
                var url = this.base_path_service.base_path_chat + '3/' + group + '/' + this.id;
                this.socket = new ReconnectingWebSocket(url);
                this.socket.onmessage = (message) => {
                    console.log("message after 3: ", message.data)
                    if (JSON.parse(message.data).job_name) {
                        var mymsg = document.createElement('p');
                        for (let i = 0; i < this.userList.length; i++) {
                            if (this.userList[i].id == JSON.parse(message.data).u_id) {
                                mymsg.innerHTML = this.userList[i].name +':'+ JSON.parse(message.data).job_name;
                            }
                        }
                        var msgHistory = document.getElementById('history')
                        msgHistory.appendChild(mymsg);
                        mymsg.scrollIntoView();
                    }
                };
            }
        };
    }

    sendMessage(value) {

        var data_to_be_send = {

            job_name: value.message,
            id: this.id,
            group: JSON.parse(this.msg.data).group_name
        }

        this.socket.send(JSON.stringify(data_to_be_send));

        this.receiverForm.reset();
    }

}

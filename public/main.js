let Peer = require('simple-peer');
let socket = io();
const video = document.querySelector('video')
let client = {}

//get video stream
//Permissions
navigator.mediaDevices.getUserMedia({
    video: true, audio: true
}).then(stream => {
    
    //The user has given permission
    //Notify backend
    socket.emit('NewClient');
    video.srcObject = stream;
    video.play();


    //used to initialize a peer
    function initPeer(type) {
        let peer = new Peer({
            initiator: (type == 'init') ? true: false,
            stream,
            trickle: false
        });
        peer.on('stream', (stream) => {
            createVideo(stream)
        })
        peer.on('close', () => {
            document.getElementById("peerVideo").remove();
            peer.destroy();
        })
        return peer
    }

    //for peer of type init
    function makePeer() {
        client.gotAnswer = false;
        let peer = initPeer('init')
        peer.on('signal', (data) => {
            if(!client.gotAnswer) {
                socket.emit('Offer', data)
            }
        })
        client.peer = peer;
    }

    //for peer of type notInit
    function frontAnswer(offer) {
        let peer = initPeer('notInit')
        peer.on('signal', (data) => {
            socket.emit('Answer', data)
        })
        peer.signal(offer);
    }

    function signalAnswer(answer) {
        client.gotAnswer = true;
        let peer = client.peer;
        peer.signal(answer);
    }

    function createVideo(stream) {
        let video  = document.createElement('video')
        video.id = 'peerVideo';
        video.srcObject = stream;
        video.class = "embed-responsive-item";
        document.querySelector('#peerDiv').appendChild(video)
        video.play();
    }

    function sessionActive() {
        document.write('Session Active. Please come back later');
    }

    socket.on('BackOffer', frontAnswer);
    socket.on('BackAnswer', signalAnswer);
    socket.on('SessionActive', sessionActive);
    socket.on('CreatePeer', makePeer);

}).catch(err => {
    document.write(err);
})

// ==UserScript==
// @name         localhostURLChanger
// @version      0.4
// @description  Change localhost to local IP
// @author       chosungmin
// @match        http://localhost/*
// @grant        none
// @updateURL    https://github.com/chosungmin/userscript/raw/master/localhostURLChanger.user.js
// @downloadURL  https://github.com/chosungmin/userscript/raw/master/localhostURLChanger.user.js 
// ==/UserScript==

(function() {
    'use strict';
    const winLoc = window.location;
    const findLocalIp = (logInfo = true) => new Promise( (resolve, reject) => {
        window.RTCPeerConnection = window.RTCPeerConnection
        || window.mozRTCPeerConnection
        || window.webkitRTCPeerConnection;

        if (typeof window.RTCPeerConnection == 'undefined') {
            return reject('WebRTC not supported by browser');
        }

        let pc = new RTCPeerConnection();
        let ips = [];

        pc.createDataChannel("");
        pc.createOffer()
            .then(offer => pc.setLocalDescription(offer))
            .catch(err => reject(err));
        pc.onicecandidate = event => {
            if ( !event || !event.candidate ) {
                // All ICE candidates have been sent.
                if (ips.length == 0) {
                    return reject('WebRTC disabled or restricted by browser');
                }

                return resolve(ips);
            }

            let parts = event.candidate.candidate.split(' ');
            let [base,componentId,protocol,priority,ip,port,,type,...attr] = parts;
            let component = ['rtp', 'rtpc'];

            if (!ips.some(e => e == ip)) {
                ips.push(ip);
            }

            if (!logInfo) {
                return;
            }

            /*
            console.log(" candidate: " + base.split(':')[1]);
            console.log(" component: " + component[componentId - 1]);
            console.log("  protocol: " + protocol);
            console.log("  priority: " + priority);
            console.log("        ip: " + ip);
            console.log("      port: " + port);
            console.log("      type: " + type);

            if ( attr.length ) {
                console.log("attributes: ");
                for(let i = 0; i < attr.length; i += 2) {
                    console.log("> " + attr[i] + ": " + attr[i+1]);
                }
            }

            console.log();
            */
        };
    });

    findLocalIp().then(function(localIp) {
        if (!localIp || !localIp[0] || !checkIP(localIp[0])) {
            return;
        }

        let url = winLoc.href.replace(`${winLoc.protocol}//${winLoc.hostname}`, `${winLoc.protocol}//${localIp[0]}`);
        window.location.replace(url);
    });
    
    function checkIP(ip) {
        var x = ip.split("."), x1, x2, x3, x4;

        if (x.length == 4) {
            x1 = parseInt(x[0], 10);
            x2 = parseInt(x[1], 10);
            x3 = parseInt(x[2], 10);
            x4 = parseInt(x[3], 10);

            if (isNaN(x1) || isNaN(x2) || isNaN(x3) || isNaN(x4)) {
                return false;
            }

            if ((x1 >= 0 && x1 <= 255) && (x2 >= 0 && x2 <= 255) && (x3 >= 0 && x3 <= 255) && (x4 >= 0 && x4 <= 255)) {
                return true;
            }
        }
        return false;
    }   
})();

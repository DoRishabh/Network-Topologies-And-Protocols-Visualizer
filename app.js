document.addEventListener('DOMContentLoaded', () => {
    // Example of real-time update simulation
    const devices = {
        light: { status: 'Off' },
        thermostat: { temp: 22 },
        camera: { status: 'Offline' }
    };

    function updateStatus() {
        document.getElementById('light-status').textContent = devices.light.status;
        document.getElementById('thermostat-temp').textContent = `${devices.thermostat.temp}°C`;
        document.getElementById('camera-status').textContent = devices.camera.status;
    }

    function toggleDevice(device) {
        if (device === 'light' || device === 'camera') {
            devices[device].status = devices[device].status === 'Off' ? 'On' : 'Off';
        }
        updateStatus();
    }

    function adjustTemperature(device) {
        if (device === 'thermostat') {
            devices[device].temp = devices[device].temp === 22 ? 18 : 22;
        }
        updateStatus();
    }

    window.toggleDevice = toggleDevice;
    window.adjustTemperature = adjustTemperature;

    // Initialize Chart.js for bandwidth usage
    const ctx = document.getElementById('bandwidthChart').getContext('2d');
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['12 AM', '3 AM', '6 AM', '9 AM', '12 PM', '3 PM', '6 PM', '9 PM'],
            datasets: [{
                label: 'Bandwidth Usage (Mbps)',
                data: [5, 10, 4, 8, 15, 10, 5, 8],
                backgroundColor: 'rgba(0, 123, 255, 0.2)',
                borderColor: 'rgba(0, 123, 255, 1)',
                borderWidth: 1,
                fill: true,
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });

    updateStatus();
});

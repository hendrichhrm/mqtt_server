const send_message = async (waktu, nilai) => {
    try {
        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                tanggal: waktu,
                value_array: nilai
            })
        };
        const response = await fetch('http://localhost:3000/skripsi/byhendrich/dashtoesp', options);
        if (!response.ok) {
            throw new Error(`Error in uploading to database: ${response.statusText}`);
        }
        return await response.json();
    } catch (error) {
        console.log(error);
        throw error;
    }
};

export default send_message;

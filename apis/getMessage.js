const get_message = async () => {
    try {
        const options = {
            method: 'GET',
            headers: {
                'Content-type': 'application/json'
            },
        }
        const response = await fetch('https://mqtt-server-kappa.vercel.app/skripsi/byhendrich/esptodash', options);
        if (!response.ok) {
            throw new Error(`Error in fetching data: ${response.statusText}`);
        }
        return await response.json();
    } catch (error) {
        console.log(error);
        throw error;
    }
}

export default get_message;

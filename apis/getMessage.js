//This code is Created by Hendrich H M
// You could adjust this code to your needs
// However, you can't remove the author's because it's against the law
// This code is Copyright of the author

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

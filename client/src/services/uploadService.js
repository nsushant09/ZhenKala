import api from './api';

const uploadImage = async (file) => {
    const formData = new FormData();
    formData.append('image', file);

    const config = {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    };

    const { data } = await api.post('/upload', formData, config);
    return data.imageUrl;
};

export default {
    uploadImage,
};

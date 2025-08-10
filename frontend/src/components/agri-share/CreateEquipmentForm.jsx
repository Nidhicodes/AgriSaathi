import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '../../api';

const CreateEquipmentForm = ({ onEquipmentCreated }) => {
    const { t } = useTranslation();
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [pincode, setPincode] = useState('');
    const [contactName, setContactName] = useState('');
    const [contactPhone, setContactPhone] = useState('');
    const [contactWhatsapp, setContactWhatsapp] = useState('');
    const [images, setImages] = useState([]);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(false);

        const formData = new FormData();
        formData.append('name', name);
        formData.append('description', description);
        formData.append('price_per_day', price);
        formData.append('pincode', pincode);
        formData.append('contact_name', contactName);
        formData.append('contact_phone', contactPhone);
        formData.append('contact_whatsapp', contactWhatsapp);
        
        formData.append('owner_id', "60d5ec49f1b2f4a6c8d9e4a1");

        if (images.length === 0) {
            setError(t('agri_share.form.image_error'));
            return;
        }

        images.forEach(image => {
            formData.append('images', image);
        });

        try {
            const newEquipment = await api.createEquipment(formData);
            setSuccess(true);
            // Clear form
            setName('');
            setDescription('');
            setPrice('');
            setPincode('');
            setContactName('');
            setContactPhone('');
            setContactWhatsapp('');
            setImages([]);
            if (onEquipmentCreated) {
                onEquipmentCreated(newEquipment);
            }
        } catch (err) {
            setError(err.message);
        }
    };

    const handleImageChange = (e) => {
        if (e.target.files) {
            setImages(Array.from(e.target.files));
        }
    };

    return (
        <div className="w-full max-w-lg mx-auto">
            <h2 className="text-3xl font-bold mb-6 text-center">{t('agri_share.list_equipment_title')}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">{t('agri_share.form.name')}</label>
                    <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm" />
                </div>
                <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">{t('agri_share.form.description')}</label>
                    <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} required rows="3" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"></textarea>
                </div>
                <div>
                    <label htmlFor="price" className="block text-sm font-medium text-gray-700">{t('agri_share.form.price')}</label>
                    <input type="number" id="price" value={price} onChange={(e) => setPrice(e.target.value)} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm" />
                </div>
                <div>
                    <label htmlFor="pincode" className="block text-sm font-medium text-gray-700">{t('agri_share.form.pincode')}</label>
                    <input type="text" id="pincode" value={pincode} onChange={(e) => setPincode(e.target.value)} required maxLength="6" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm" />
                </div>

                <hr />

                <h3 className="text-lg font-medium leading-6 text-gray-900">{t('agri_share.form.contact_info')}</h3>
                <div>
                    <label htmlFor="contactName" className="block text-sm font-medium text-gray-700">{t('agri_share.form.contact_name')}</label>
                    <input type="text" id="contactName" value={contactName} onChange={(e) => setContactName(e.target.value)} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm" />
                </div>
                <div>
                    <label htmlFor="contactPhone" className="block text-sm font-medium text-gray-700">{t('agri_share.form.phone')}</label>
                    <input type="tel" id="contactPhone" value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm" />
                </div>
                <div>
                    <label htmlFor="contactWhatsapp" className="block text-sm font-medium text-gray-700">{t('agri_share.form.whatsapp')}</label>
                    <input type="tel" id="contactWhatsapp" value={contactWhatsapp} onChange={(e) => setContactWhatsapp(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm" />
                </div>

                <hr />

                <h3 className="text-lg font-medium leading-6 text-gray-900">{t('agri_share.form.images')}</h3>
                <div>
                    <label htmlFor="images" className="block text-sm font-medium text-gray-700">{t('agri_share.form.upload_images')}</label>
                    <input 
                        type="file" 
                        id="images" 
                        onChange={handleImageChange} 
                        multiple 
                        accept="image/*"
                        className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-light file:text-primary-dark hover:file:bg-primary-light/80"
                    />
                </div>

                {images.length > 0 && (
                    <div className="mt-4 grid grid-cols-3 sm:grid-cols-4 gap-4">
                        {images.map((image, index) => (
                            <img
                                key={index}
                                src={URL.createObjectURL(image)}
                                alt={`Preview ${index + 1}`}
                                className="h-24 w-full object-cover rounded-md"
                                onLoad={(e) => URL.revokeObjectURL(e.target.src)} 
                            />
                        ))}
                    </div>
                )}

                <button type="submit" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
                    {t('agri_share.form.list_button')}
                </button>
                {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
                {success && <p className="text-green-500 text-sm mt-2">{t('agri_share.form.success_message')}</p>}
            </form>
        </div>
    );
};

export default CreateEquipmentForm;

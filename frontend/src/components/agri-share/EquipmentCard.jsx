import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

const ImageGalleryModal = ({ images, onClose }) => {
    const { t } = useTranslation();
    if (!images || images.length === 0) return null;

    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
            onClick={onClose}
        >
            <div 
                className="bg-white p-4 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()} 
            >
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold">{t('agri_share.gallery.title')}</h2>
                    <button onClick={onClose} className="text-2xl font-bold">&times;</button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {images.map((url, index) => (
                        <img key={index} src={url} alt={`Equipment image ${index + 1}`} className="w-full h-auto object-cover rounded-md" />
                    ))}
                </div>
            </div>
        </div>
    );
};


const EquipmentCard = ({ equipment }) => {
    const { t } = useTranslation();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const primaryImage = equipment.image_urls && equipment.image_urls.length > 0
        ? equipment.image_urls[0]
        : `https://via.placeholder.com/400x300.png?text=${t('agri_share.card.no_image').replace(' ', '+')}`;

    return (
        <>
            <div className="bg-white border rounded-lg shadow-md overflow-hidden transition-transform transform hover:-translate-y-1">
                <div className="relative">
                    <img 
                        src={primaryImage} 
                        alt={equipment.name} 
                        className="w-full h-48 object-cover cursor-pointer"
                        onClick={() => equipment.image_urls?.length > 0 && setIsModalOpen(true)}
                    />
                    {equipment.image_urls?.length > 1 && (
                        <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white text-xs font-bold py-1 px-2 rounded-full">
                            {equipment.image_urls.length} {t('agri_share.card.photos')}
                        </div>
                    )}
                </div>

                <div className="p-4">
                    <h3 className="text-xl font-bold text-gray-800 truncate">{equipment.name}</h3>
                    <p className="text-gray-600 h-12 overflow-hidden text-ellipsis">{equipment.description}</p>
                    
                    <div className="mt-4">
                        <p className="text-2xl font-extrabold text-primary">
                            ₹{equipment.price_per_day}
                            <span className="text-sm font-medium text-gray-500">{t('agri_share.card.per_day')}</span>
                        </p>
                    </div>

                    <hr className="my-4" />

                    <div className="space-y-2">
                        <div>
                            <p className="text-sm font-medium text-gray-500">{t('agri_share.card.contact')}</p>
                            <p className="font-semibold text-gray-800">{equipment.contact_name}</p>
                        </div>
                         <div>
                            <p className="text-sm font-medium text-gray-500">{t('agri_share.card.phone')}</p>
                            <a href={`tel:${equipment.contact_phone}`} className="font-semibold text-primary hover:underline">
                                {equipment.contact_phone}
                            </a>
                        </div>
                        {equipment.contact_whatsapp && (
                            <div>
                                <p className="text-sm font-medium text-gray-500">{t('agri_share.card.whatsapp')}</p>
                                <a href={`https://wa.me/${equipment.contact_whatsapp}`} target="_blank" rel="noopener noreferrer" className="font-semibold text-green-600 hover:underline">
                                    {equipment.contact_whatsapp}
                                </a>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {isModalOpen && (
                <ImageGalleryModal images={equipment.image_urls} onClose={() => setIsModalOpen(false)} />
            )}
        </>
    );
};

export default EquipmentCard;

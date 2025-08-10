import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '../../api';
import EquipmentCard from './EquipmentCard';
import CreateEquipmentForm from './CreateEquipmentForm';

const EquipmentList = () => {
    const { t } = useTranslation();
    const [equipment, setEquipment] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showCreateForm, setShowCreateForm] = useState(false);

    const fetchEquipment = async () => {
        try {
            setLoading(true);
            const data = await api.getEquipmentList();
            setEquipment(data.equipment || []);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEquipment();
    }, []);

    const handleEquipmentCreated = (newEquipment) => {
        setEquipment(prev => [newEquipment, ...prev]);
        setShowCreateForm(false);
    };

    if (loading) return <div>{t('agri_share.list.loading')}</div>;
    if (error) return <div className="text-red-500">{t('agri_share.list.error_prefix')}: {error}</div>;

    return (
        <div className="w-full">
            <div className="flex flex-wrap gap-4 justify-between items-center mb-6">
                <h2 className="text-3xl font-bold">{t('agri_share.list.available_equipment')}</h2>
                <button
                    onClick={() => setShowCreateForm(!showCreateForm)}
                    className="py-2 px-4 bg-secondary text-white rounded-lg hover:bg-secondary-dark transition-colors"
                >
                    {showCreateForm ? t('agri_share.list.cancel') : t('agri_share.list.list_your_equipment_button')}
                </button>
            </div>

            {showCreateForm && (
                <div className="mb-8">
                    <CreateEquipmentForm onEquipmentCreated={handleEquipmentCreated} />
                </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {equipment.length > 0 ? (
                    equipment.map(item => (
                        <EquipmentCard key={item.id} equipment={item} />
                    ))
                ) : (
                    <p className="col-span-full text-center">{t('agri_share.list.no_equipment_available')}</p>
                )}
            </div>
        </div>
    );
};

export default EquipmentList;

import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

interface PaymentMethod {
    id: number;
    type: string;
    bank_name?: string;
    account_name?: string;
    account_number?: string;
    branch?: string;
    e_wallet_network?: string;
    wallet_name?: string;
    wallet_number?: string;
    instructions?: string;
}

interface PaymentSelectorProps {
    totalAmount: number;
    onPaymentSelect: (method: string, details?: any) => void;
    shopId: string | number;
}

export const PaymentSelector: React.FC<PaymentSelectorProps> = ({ totalAmount, onPaymentSelect, shopId }) => {
    const [methods, setMethods] = useState<PaymentMethod[]>([]);
    const [selectedMethodId, setSelectedMethodId] = useState<number | null>(null);
    const [paymentType, setPaymentType] = useState<'cash_on_delivery' | 'bank_transfer' | 'e_wallet'>('cash_on_delivery');
    const [receiptImage, setReceiptImage] = useState<File | null>(null);
    const [transactionId, setTransactionId] = useState('');

    useEffect(() => {
        fetchMethods();
    }, [shopId]);

    const fetchMethods = async () => {
        try {
            const response = await api.get(`/shops/${shopId}/payment-methods`);
            setMethods(response.data);
        } catch (error) {
            console.error('Error fetching payment methods:', error);
        }
    };

    const handleSelection = (type: 'cash_on_delivery' | 'bank_transfer' | 'e_wallet', methodId?: number) => {
        setPaymentType(type);
        setSelectedMethodId(methodId || null);

        // If cash on delivery, notify immediately. For others, wait for details
        if (type === 'cash_on_delivery') {
            onPaymentSelect('cash_on_delivery');
        }
    };

    const handleDetailsSubmit = () => {
        if (!receiptImage || !transactionId) {
            alert('يرجى رفع صورة الإيصال ورقم العملية');
            return;
        }

        onPaymentSelect(paymentType, {
            methodId: selectedMethodId,
            receipt: receiptImage,
            transactionId: transactionId
        });
    };

    const bankMethods = methods.filter(m => m.type === 'bank_transfer');
    const walletMethods = methods.filter(m => m.type === 'e_wallet');
    const selectedMethod = methods.find(m => m.id === selectedMethodId);

    return (
        <div className="space-y-6">
            <h3 className="text-xl font-bold mb-4">اختر طريقة الدفع</h3>

            <div className="space-y-3">
                {/* Cash on Delivery */}
                <label className={`block border p-4 rounded-lg cursor-pointer transition-all ${paymentType === 'cash_on_delivery' ? 'border-primary bg-primary-50 ring-2 ring-primary' : 'hover:border-gray-300'}`}>
                    <div className="flex items-center gap-3">
                        <input
                            type="radio"
                            name="payment_type"
                            checked={paymentType === 'cash_on_delivery'}
                            onChange={() => handleSelection('cash_on_delivery')}
                            className="text-primary focus:ring-primary"
                        />
                        <div>
                            <span className="font-bold block">💵 الدفع عند الاستلام</span>
                            <span className="text-sm text-gray-600">ادفع نقداً عند استلام طلبك</span>
                        </div>
                    </div>
                </label>

                {/* Bank Transfers */}
                {bankMethods.length > 0 && (
                    <div className="space-y-2">
                        <h4 className="font-medium text-gray-700 mt-4 mb-2">🏦 التحويل البنكي</h4>
                        {bankMethods.map(method => (
                            <label key={method.id} className={`block border p-4 rounded-lg cursor-pointer transition-all ${selectedMethodId === method.id ? 'border-primary bg-primary-50 ring-2 ring-primary' : 'hover:border-gray-300'}`}>
                                <div className="flex items-center gap-3">
                                    <input
                                        type="radio"
                                        name="payment_type"
                                        checked={selectedMethodId === method.id}
                                        onChange={() => handleSelection('bank_transfer', method.id)}
                                        className="text-primary focus:ring-primary"
                                    />
                                    <div>
                                        <span className="font-bold block">{method.bank_name}</span>
                                        <span className="text-sm text-gray-600">{method.account_name} - {method.account_number}</span>
                                    </div>
                                </div>
                            </label>
                        ))}
                    </div>
                )}

                {/* E-Wallets */}
                {walletMethods.length > 0 && (
                    <div className="space-y-2">
                        <h4 className="font-medium text-gray-700 mt-4 mb-2">💰 المحافظ الإلكترونية</h4>
                        {walletMethods.map(method => (
                            <label key={method.id} className={`block border p-4 rounded-lg cursor-pointer transition-all ${selectedMethodId === method.id ? 'border-primary bg-primary-50 ring-2 ring-primary' : 'hover:border-gray-300'}`}>
                                <div className="flex items-center gap-3">
                                    <input
                                        type="radio"
                                        name="payment_type"
                                        checked={selectedMethodId === method.id}
                                        onChange={() => handleSelection('e_wallet', method.id)}
                                        className="text-primary focus:ring-primary"
                                    />
                                    <div>
                                        <span className="font-bold block">{method.e_wallet_network}</span>
                                        <span className="text-sm text-gray-600">{method.wallet_name} - {method.wallet_number}</span>
                                    </div>
                                </div>
                            </label>
                        ))}
                    </div>
                )}
            </div>

            {/* Selected Payment Details Form */}
            {paymentType !== 'cash_on_delivery' && selectedMethod && (
                <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 mt-6 animate-fade-in">
                    <h4 className="font-bold mb-4 flex items-center gap-2">
                        <span>📝 إثبات الدفع لـ {selectedMethod.type === 'bank_transfer' ? selectedMethod.bank_name : selectedMethod.e_wallet_network}</span>
                    </h4>

                    <div className="mb-4 text-sm text-gray-700 bg-white p-3 rounded border">
                        <p className="font-bold">يرجى تحويل مبلغ {totalAmount.toLocaleString()} ر.ي إلى:</p>
                        <p>الاسم: {selectedMethod.type === 'bank_transfer' ? selectedMethod.account_name : selectedMethod.wallet_name}</p>
                        <p>الرقم: {selectedMethod.type === 'bank_transfer' ? selectedMethod.account_number : selectedMethod.wallet_number}</p>
                        {selectedMethod.instructions && <p className="mt-2 text-primary">{selectedMethod.instructions}</p>}
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">صورة الإيصال / الرسالة</label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => setReceiptImage(e.target.files?.[0] || null)}
                                className="w-full p-2 bg-white border rounded"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">رقم العملية / الحوالة</label>
                            <input
                                type="text"
                                value={transactionId}
                                onChange={(e) => setTransactionId(e.target.value)}
                                placeholder="أدخل رقم العملية الموجود في الإيصال"
                                className="w-full p-2 border rounded"
                            />
                        </div>

                        <button
                            onClick={handleDetailsSubmit}
                            disabled={!receiptImage || !transactionId}
                            className="w-full py-2 bg-primary text-white rounded hover:bg-primary-dark disabled:bg-gray-300 disabled:cursor-not-allowed"
                        >
                            تأكيد الدفع وإرسال الطلب
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

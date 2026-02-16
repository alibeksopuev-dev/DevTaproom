import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, QrCode, MessageCircle, Loader2 } from 'lucide-react';
import { Header } from '@/components/Header/Header';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useCartStore, useUIStore } from '@/lib/store';
import { getTranslation } from '@/lib/i18n/translations';
import { formatPrice } from '@/lib/utils';
import { generateVietQRUrl } from '@/lib/payment';
import { sendToWhatsApp } from '@/lib/whatsapp';
import { useCreateOrderMutation } from '@/entities/orders/api';
import { ORGANIZATION_ID } from '@/lib/constants';

export function Checkout() {
    const navigate = useNavigate();
    const { items, orderNotes, getTotal, clearCart } = useCartStore();
    const { language } = useUIStore();
    const t = getTranslation(language);
    const [createOrder, { isLoading }] = useCreateOrderMutation();
    const [tableNumber, setTableNumber] = useState('');
    const [orderId, setOrderId] = useState<string | null>(null);
    const [orderNumber, setOrderNumber] = useState<string | null>(null);
    const [showQR, setShowQR] = useState(false);

    const total = getTotal();

    if (items.length === 0 && !orderId) {
        navigate('/cart');
        return null;
    }

    const handlePayWithVietQR = async () => {
        try {
            const orderItems = items.map((item) => {
                let itemPrice = item.product.price;
                if (item.selectedSize && item.product.prices && item.product.prices.length > 0) {
                    const sizePrice = item.product.prices.find(p => p.size === item.selectedSize);
                    if (sizePrice) itemPrice = sizePrice.price;
                }
                return {
                    menu_item_id: item.product.id,
                    item_name: item.product.name,
                    size: item.selectedSize || undefined,
                    quantity: item.quantity,
                    unit_price: itemPrice,
                    total_price: itemPrice * item.quantity,
                };
            });

            const result = await createOrder({
                organization_id: ORGANIZATION_ID,
                total_amount: total,
                notes: orderNotes || undefined,
                table_number: tableNumber || undefined,
                payment_method: 'vietqr',
                items: orderItems,
            }).unwrap();

            setOrderId(result.id);
            setOrderNumber(result.order_number);
            setShowQR(true);
        } catch (error) {
            console.error('Failed to create order:', error);
        }
    };

    const handleWhatsApp = () => {
        sendToWhatsApp(items, orderNotes, language, clearCart);
    };

    const handlePaymentDone = () => {
        clearCart();
        navigate(`/order/${orderId}`);
    };

    const qrImageUrl = orderNumber ? generateVietQRUrl(total, orderNumber) : '';

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />

            <main className="max-w-lg mx-auto px-4 py-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">{t.checkout}</h2>

                {!showQR ? (
                    <>
                        {/* Order Summary */}
                        <Card className="p-4 mb-4">
                            <h3 className="font-semibold text-gray-900 mb-3">{t.yourCart}</h3>
                            <div className="space-y-2">
                                {items.map((item) => {
                                    let itemPrice = item.product.price;
                                    if (item.selectedSize && item.product.prices && item.product.prices.length > 0) {
                                        const sizePrice = item.product.prices.find(p => p.size === item.selectedSize);
                                        if (sizePrice) itemPrice = sizePrice.price;
                                    }
                                    return (
                                        <div key={`${item.product.id}-${item.selectedSize}`} className="flex justify-between text-sm">
                                            <span className="text-gray-700">
                                                {item.product.name}
                                                {item.selectedSize ? ` (${item.selectedSize}L)` : ''}
                                                {' × '}{item.quantity}
                                            </span>
                                            <span className="text-gray-900 font-medium">
                                                {formatPrice(itemPrice * item.quantity)}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                            <div className="border-t border-gray-200 mt-3 pt-3 flex justify-between">
                                <span className="font-semibold text-gray-900">{t.total}</span>
                                <span className="font-bold text-lg text-gray-900">{formatPrice(total)}</span>
                            </div>
                        </Card>

                        {/* Table Number */}
                        <Card className="p-4 mb-4">
                            <label htmlFor="table-number" className="block text-sm font-medium text-gray-700 mb-2">
                                {t.tableNumber}
                            </label>
                            <input
                                id="table-number"
                                type="text"
                                value={tableNumber}
                                onChange={(e) => setTableNumber(e.target.value)}
                                placeholder={t.tableNumberPlaceholder}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </Card>

                        {/* Payment Options */}
                        <div className="space-y-3">
                            <Button
                                onClick={handlePayWithVietQR}
                                disabled={isLoading || items.length === 0}
                                className="w-full min-h-[52px] text-base font-semibold bg-blue-600 hover:bg-blue-700"
                                size="lg"
                            >
                                {isLoading ? (
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                ) : (
                                    <QrCode className="mr-2 h-5 w-5" />
                                )}
                                {t.payWithVietQR}
                            </Button>

                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-gray-300" />
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="px-2 bg-gray-50 text-gray-500">{t.orSendViaWhatsApp}</span>
                                </div>
                            </div>

                            <Button
                                onClick={handleWhatsApp}
                                variant="outline"
                                disabled={items.length === 0}
                                className="w-full min-h-[48px] text-base"
                                size="lg"
                            >
                                <MessageCircle className="mr-2 h-5 w-5" />
                                {t.sendOrder}
                            </Button>
                        </div>
                    </>
                ) : (
                    /* VietQR Code Display */
                    <Card className="p-6 text-center">
                        <div className="mb-4">
                            <QrCode className="mx-auto h-10 w-10 text-blue-600 mb-2" />
                            <h3 className="text-lg font-semibold text-gray-900">{t.scanQRToPay}</h3>
                            <p className="text-sm text-gray-500 mt-1">{t.scanQRInstruction}</p>
                        </div>

                        {/* QR Code Image */}
                        <div className="bg-white p-4 rounded-lg border-2 border-gray-100 inline-block mb-4">
                            <img
                                src={qrImageUrl}
                                alt="VietQR Payment Code"
                                className="w-64 mx-auto"
                                loading="eager"
                            />
                        </div>

                        {/* Payment Details */}
                        <div className="text-left bg-gray-50 rounded-lg p-4 mb-4 space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">{t.orderNumber}</span>
                                <span className="font-mono font-semibold text-gray-900">{orderNumber}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">{t.total}</span>
                                <span className="font-bold text-gray-900">{formatPrice(total)}</span>
                            </div>
                            {tableNumber && (
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">{t.tableNumber}</span>
                                    <span className="font-semibold text-gray-900">{tableNumber}</span>
                                </div>
                            )}
                        </div>

                        {/* Confirm Payment Button */}
                        <Button
                            onClick={handlePaymentDone}
                            className="w-full min-h-[48px] text-base font-semibold"
                            size="lg"
                        >
                            {t.orderPlaced} — {t.viewOrderStatus}
                        </Button>

                        <p className="text-xs text-gray-400 mt-3">
                            {t.waitingForPayment}
                        </p>
                    </Card>
                )}
            </main>
        </div>
    );
}

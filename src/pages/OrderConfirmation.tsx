import { Link, useParams } from 'react-router-dom';
import { CheckCircle2, Clock, ChefHat, PackageCheck, Loader2, QrCode } from 'lucide-react';
import { Header } from '@/components/Header/Header';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useUIStore } from '@/lib/store';
import { getTranslation } from '@/lib/i18n/translations';
import { formatPrice } from '@/lib/utils';
import { generateVietQRUrl } from '@/lib/payment';
import { useGetOrderByIdQuery } from '@/entities/orders/api';
import type { OrderStatus } from '@/types/order';

const STATUS_CONFIG: Record<OrderStatus, { icon: typeof CheckCircle2; color: string }> = {
    pending: { icon: Clock, color: 'text-yellow-500' },
    paid: { icon: CheckCircle2, color: 'text-green-500' },
    confirmed: { icon: CheckCircle2, color: 'text-green-600' },
    preparing: { icon: ChefHat, color: 'text-orange-500' },
    ready: { icon: PackageCheck, color: 'text-blue-500' },
    completed: { icon: CheckCircle2, color: 'text-green-700' },
    cancelled: { icon: Clock, color: 'text-red-500' },
};

export function OrderConfirmation() {
    const { orderId } = useParams<{ orderId: string }>();
    const { language } = useUIStore();
    const t = getTranslation(language);

    const { data: order, isLoading, error } = useGetOrderByIdQuery(
        { id: orderId! },
        {
            skip: !orderId,
            pollingInterval: 5000, // Poll every 5s for status updates
        }
    );

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Header />
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                </div>
            </div>
        );
    }

    if (error || !order) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Header />
                <div className="max-w-lg mx-auto px-4 py-20 text-center">
                    <p className="text-gray-600 mb-4">Order not found</p>
                    <Link to="/">
                        <Button>{t.backToMenu}</Button>
                    </Link>
                </div>
            </div>
        );
    }

    const statusConfig = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
    const StatusIcon = statusConfig.icon;
    const isPaid = order.payment_status === 'paid';
    const showQR = !isPaid && order.payment_method === 'vietqr';
    const qrImageUrl = showQR ? generateVietQRUrl(order.total_amount, order.order_number) : '';

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />

            <main className="max-w-lg mx-auto px-4 py-6">
                {/* Status Banner */}
                <Card className="p-6 text-center mb-4">
                    <StatusIcon className={`mx-auto h-12 w-12 ${statusConfig.color} mb-3`} />
                    <h2 className="text-xl font-bold text-gray-900 mb-1">
                        {isPaid ? t.paymentConfirmed : t.orderPlaced}
                    </h2>
                    <p className="text-gray-500 text-sm">{t.orderConfirmedMessage}</p>
                </Card>

                {/* VietQR Payment */}
                {showQR && (
                    <Card className="p-6 text-center mb-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">{t.scanQRToPay}</h3>
                        <p className="text-sm text-gray-500 mb-4">{t.scanQRInstruction}</p>

                        <div className="bg-white pt-4 rounded-lg border-2 border-gray-100 inline-block mb-4">
                            <img
                                src={qrImageUrl}
                                alt="VietQR Payment Code"
                                className="mx-auto"
                                loading="eager"
                            />
                        </div>

                        <div className="mb-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={async () => {
                                    try {
                                        const res = await fetch(qrImageUrl);
                                        const blob = await res.blob();
                                        const url = URL.createObjectURL(blob);
                                        const a = document.createElement('a');
                                        a.href = url;
                                        a.download = `${order.order_number}-qr.png`;
                                        a.click();
                                        URL.revokeObjectURL(url);
                                    } catch {
                                        window.open(qrImageUrl, '_blank');
                                    }
                                }}
                            >
                                <QrCode className="mr-1.5 h-4 w-4" />
                                {t.saveQR}
                            </Button>
                        </div>

                        <p className="text-xs text-gray-400 mt-2">
                            {t.waitingForPayment}
                        </p>
                    </Card>
                )}

                {/* Order Info */}
                <Card className="p-4 mb-4">
                    <div className="space-y-3">
                        <div className="flex justify-between">
                            <span className="text-sm text-gray-600">{t.orderNumber}</span>
                            <span className="text-gray-900 text-sm">{order.order_number}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">{t.orderStatus}</span>
                            <span className={`text-sm font-semibold capitalize ${statusConfig.color}`}>
                                {order.status === 'preparing' ? t.preparing :
                                    order.status === 'ready' ? t.ready :
                                        order.status === 'completed' ? t.completed :
                                            order.status}
                            </span>
                        </div>
                        {order.table_number && (
                            <div className="flex justify-between">
                                <span className="text-sm text-gray-600">{t.tableNumber}</span>
                                <span className="font-semibold text-gray-900">{order.table_number}</span>
                            </div>
                        )}
                        <div className="flex justify-between">
                            <span className="text-sm text-gray-600">{t.total}</span>
                            <span className="font-bold text-gray-900">{formatPrice(order.total_amount)}</span>
                        </div>
                    </div>
                </Card>

                {/* Order Items */}
                {order.items && order.items.length > 0 && (
                    <Card className="p-4 mb-4">
                        <h3 className="font-semibold text-gray-900 mb-3">{t.yourCart}</h3>
                        <div className="space-y-3">
                            {order.items.map((item) => (
                                <div key={item.id} className="text-sm">
                                    <div className="font-medium text-gray-900">
                                        {item.item_name}
                                    </div>
                                    <div className="flex justify-between text-gray-500 mt-0.5">
                                        <span>{item.size ? `${item.size} × ` : ''}{item.quantity}</span>
                                        <span className="text-gray-900 font-medium">{formatPrice(item.total_price)}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>
                )}

                {/* Back to Menu */}
                <Link to="/">
                    <Button
                        variant="outline"
                        className="w-full min-h-[48px] text-base"
                        size="lg"
                    >
                        {t.backToMenu}
                    </Button>
                </Link>
            </main>
        </div>
    );
}

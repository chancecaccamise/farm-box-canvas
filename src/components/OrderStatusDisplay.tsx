import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Package, Calendar, MapPin, Clock, CheckCircle, Truck } from "lucide-react";
import { Link } from "react-router-dom";

interface Order {
  id: string;
  created_at: string;
  total_amount: number;
  status: string;
  payment_status: string;
  order_confirmation_number?: string;
}

interface OrderStatusDisplayProps {
  orders: Order[];
}

export function OrderStatusDisplay({ orders }: OrderStatusDisplayProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'preparing':
        return 'bg-orange-100 text-orange-800';
      case 'out_for_delivery':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="w-4 h-4" />;
      case 'preparing':
        return <Package className="w-4 h-4" />;
      case 'out_for_delivery':
        return <Truck className="w-4 h-4" />;
      case 'delivered':
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusMessage = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Your order is being processed';
      case 'confirmed':
        return 'Order confirmed - preparing your fresh produce';
      case 'preparing':
        return 'Selecting the freshest items for your box';
      case 'out_for_delivery':
        return 'Your farm box is on its way!';
      case 'delivered':
        return 'Delivered - enjoy your fresh produce!';
      default:
        return 'Order status unknown';
    }
  };

  const getExpectedDelivery = () => {
    const today = new Date();
    const nextTuesday = new Date(today);
    nextTuesday.setDate(today.getDate() + ((2 - today.getDay() + 7) % 7));
    const nextFriday = new Date(nextTuesday);
    nextFriday.setDate(nextTuesday.getDate() + 3);
    
    return `${nextTuesday.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${nextFriday.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Your Farm Box Orders
        </h1>
        <p className="text-gray-600">
          Track your orders and manage your deliveries
        </p>
      </div>

      {orders.map((order) => (
        <Card key={order.id} className="border-l-4 border-l-green-500">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="flex items-center space-x-2">
                  <Package className="w-5 h-5" />
                  <span>Order #{order.order_confirmation_number || order.id.slice(0, 8).toUpperCase()}</span>
                </CardTitle>
                <p className="text-sm text-gray-600 mt-1">
                  Placed on {new Date(order.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
              <Badge className={`${getStatusColor(order.status)} flex items-center space-x-1`}>
                {getStatusIcon(order.status)}
                <span className="capitalize">{order.status.replace('_', ' ')}</span>
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Status Message */}
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className="flex-shrink-0">
                  {getStatusIcon(order.status)}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{getStatusMessage(order.status)}</p>
                  {order.status !== 'delivered' && (
                    <p className="text-sm text-gray-600">
                      Expected delivery: {getExpectedDelivery()}
                    </p>
                  )}
                </div>
              </div>

              {/* Order Details */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-900">Order Total</h4>
                  <p className="text-2xl font-bold text-green-600">
                    ${order.total_amount.toFixed(2)}
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-900">Payment Status</h4>
                  <Badge variant={order.payment_status === 'paid' ? 'default' : 'secondary'}>
                    {order.payment_status === 'paid' ? 'Paid' : 'Pending'}
                  </Badge>
                </div>
              </div>

              {/* Progress Tracker */}
              <div className="space-y-3">
                <h4 className="font-medium text-gray-900">Delivery Progress</h4>
                <div className="flex items-center space-x-4">
                  {['confirmed', 'preparing', 'out_for_delivery', 'delivered'].map((step, index) => {
                    const isCompleted = ['confirmed', 'preparing', 'out_for_delivery', 'delivered'].indexOf(order.status) >= index;
                    const isCurrent = order.status === step;
                    
                    return (
                      <div key={step} className="flex items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          isCompleted 
                            ? 'bg-green-500 text-white' 
                            : isCurrent 
                              ? 'bg-blue-500 text-white'
                              : 'bg-gray-200 text-gray-500'
                        }`}>
                          {isCompleted ? (
                            <CheckCircle className="w-4 h-4" />
                          ) : (
                            <span className="text-xs font-bold">{index + 1}</span>
                          )}
                        </div>
                        {index < 3 && (
                          <div className={`w-12 h-1 mx-2 ${
                            isCompleted ? 'bg-green-500' : 'bg-gray-200'
                          }`} />
                        )}
                      </div>
                    );
                  })}
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-2">
                  <span>Confirmed</span>
                  <span>Preparing</span>
                  <span>En Route</span>
                  <span>Delivered</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
        <Button asChild size="lg">
          <Link to="/box-selection">Order Another Box</Link>
        </Button>
        <Button variant="outline" asChild size="lg">
          <Link to="/">Browse Products</Link>
        </Button>
      </div>
    </div>
  );
}
import { useState, useEffect } from "react";
import { Clock, Lock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface CountdownTimerProps {
  cutoffTime: string;
  isConfirmed: boolean;
}

export function CountdownTimer({ cutoffTime, isConfirmed }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    isPast: boolean;
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0, isPast: false });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const cutoff = new Date(cutoffTime).getTime();
      const difference = cutoff - now;

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        setTimeLeft({ days, hours, minutes, seconds, isPast: false });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isPast: true });
      }
    };

    // Calculate immediately
    calculateTimeLeft();

    // Update every second
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [cutoffTime]);

  const formatCutoffTime = () => {
    const date = new Date(cutoffTime);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      month: 'long', 
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      timeZoneName: 'short'
    });
  };

  if (isConfirmed) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardContent className="pt-6">
          <div className="flex items-center justify-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-green-800 font-medium">Bag Confirmed for This Week</span>
            </div>
            <Badge variant="outline" className="border-green-300 text-green-700">
              Locked
            </Badge>
          </div>
          <p className="text-sm text-green-600 text-center mt-2">
            Your selections are locked and will be delivered as scheduled.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (timeLeft.isPast) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="pt-6">
          <div className="flex items-center justify-center gap-3">
            <Lock className="h-5 w-5 text-red-600" />
            <span className="text-red-800 font-medium">Cutoff Time Has Passed</span>
          </div>
          <p className="text-sm text-red-600 text-center mt-2">
            Your bag is now locked for the week. Cutoff was {formatCutoffTime()}.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-orange-200 bg-orange-50">
      <CardContent className="pt-6">
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Clock className="h-5 w-5 text-orange-600" />
            <span className="text-orange-800 font-medium">
              Confirm your bag by {formatCutoffTime()}
            </span>
          </div>
          
          <div className="flex items-center justify-center gap-1 text-lg font-bold text-orange-900">
            <span>Time left:</span>
            <div className="flex items-center gap-1 ml-2">
              {timeLeft.days > 0 && (
                <>
                  <span className="bg-orange-100 px-2 py-1 rounded text-orange-800">
                    {timeLeft.days}d
                  </span>
                </>
              )}
              <span className="bg-orange-100 px-2 py-1 rounded text-orange-800">
                {timeLeft.hours}h
              </span>
              <span className="bg-orange-100 px-2 py-1 rounded text-orange-800">
                {timeLeft.minutes}m
              </span>
              <span className="bg-orange-100 px-2 py-1 rounded text-orange-800">
                {timeLeft.seconds}s
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
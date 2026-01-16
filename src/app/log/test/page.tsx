'use client'
import React from 'react'

import { 
  ArrowRight, 
  Box, 
  Calendar, 
  Clock, 

  MapPin, 
  Scale, 
  Truck 
} from 'lucide-react';
import { Button, Card, CardContent } from '@/shared/components/ui';
import { Separator } from '@/shared/components/ui/separator';
import { Badge } from '@/shared/components/ui/badge';


interface TenderCardProps {
  id: string;
  origin: { city: string; zip: string; date: string; time: string };
  destination: { city: string; zip: string; date: string; time: string };
  customs: { export: string; import: string };
  cargo: { type: string; weight: string; quantity: string; items: string };
  equipment: { type: string; loading: string; belts: number };
  pricing: {
    startPrice: number;
    step: number;
    buyNow: number;
    myBid?: number;
    bestBid: number;
    currency: string;
    currencyEuro: number;
  };
  timeLeft: string;
}

export const TenderCard = ({ id, origin, destination, customs, cargo, equipment, pricing, timeLeft }: TenderCardProps) => {
  return (
    <Card className="overflow-hidden border-l-4 border-l-primary shadow-md transition-all hover:shadow-lg dark:bg-slate-950">
      <CardContent className="p-0">
        <div className="flex flex-col lg:flex-row">
          
          {/* ID та Маршрут */}
          <div className="flex-[2] p-4 flex flex-col justify-center border-b lg:border-b-0 lg:border-r bg-muted/30">
            <span className="text-xs font-bold text-primary mb-2 uppercase tracking-wider">Лот: {id}</span>
            <div className="flex items-start gap-4">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2 font-semibold text-sm">
                  <MapPin className="w-4 h-4 text-blue-500" /> {origin.zip}, {origin.city}
                </div>
                <div className="text-[11px] text-muted-foreground flex items-center gap-1 ml-6">
                  <Calendar className="w-3 h-3" /> {origin.date} <Clock className="w-3 h-3 ml-1" /> {origin.time}
                </div>
              </div>
              <ArrowRight className="w-4 h-4 mt-1 text-muted-foreground" />
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2 font-semibold text-sm">
                  <MapPin className="w-4 h-4 text-green-500" /> {destination.zip}, {destination.city}
                </div>
                <div className="text-[11px] text-muted-foreground flex items-center gap-1 ml-6">
                  <Calendar className="w-3 h-3" /> {destination.date} <Clock className="w-3 h-3 ml-1" /> {destination.time}
                </div>
              </div>
            </div>
          </div>

          {/* Митниця */}
          <div className="flex-1 p-4 border-b lg:border-b-0 lg:border-r flex flex-col justify-center text-xs gap-2">
            <div>
              <span className="text-muted-foreground block mb-1">Замитнення:</span>
              <span className="font-medium">{customs.export}</span>
            </div>
            <Separator />
            <div>
              <span className="text-muted-foreground block mb-1">Розмитнення:</span>
              <span className="font-medium">{customs.import}</span>
            </div>
          </div>

          {/* Характеристики вантажу */}
          <div className="flex-1 p-4 border-b lg:border-b-0 lg:border-r flex flex-col justify-center gap-3">
            <div className="flex items-center gap-2 text-xs">
              <Truck className="w-4 h-4 text-muted-foreground" />
              <span>{equipment.type}, {equipment.loading}</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <Box className="w-4 h-4 text-muted-foreground" />
              <span className="font-medium">{cargo.quantity}, {cargo.weight}, {cargo.items}</span>
            </div>
            <Badge variant="secondary" className="w-fit text-[10px]">
              Ремні: {equipment.belts} шт
            </Badge>
          </div>

          {/* Ставки та Дії */}
          <div className="flex-[1.5] flex flex-col bg-muted/10">
            <div className="p-4 grid grid-cols-2 gap-4 border-b">
              <div className="text-center">
                <p className="text-[10px] text-muted-foreground uppercase">Ваша ставка</p>
                <p className="text-sm font-bold text-destructive">{pricing.myBid?.toLocaleString()} {pricing.currency}</p>
                <p className="text-[10px] text-muted-foreground">({pricing.currencyEuro}€)</p>
              </div>
              <div className="text-center">
                <p className="text-[10px] text-muted-foreground uppercase">Краща ставка</p>
                <p className="text-sm font-bold text-green-600">{pricing.bestBid.toLocaleString()} {pricing.currency}</p>
                <p className="text-[10px] text-muted-foreground">(1 120€)</p>
              </div>
            </div>

            <div className="p-3 flex flex-col gap-2">
                <div className="flex items-center justify-between text-[11px] px-1">
                    <span className="text-muted-foreground">Крок: {pricing.step} грн</span>
                    <span className="flex items-center gap-1 font-medium"><Clock className="w-3 h-3"/> {timeLeft}</span>
                </div>
                <Button size="sm" className="w-full font-bold uppercase tracking-tight">
                    Зробити ставку
                </Button>
                <Button variant="outline" size="sm" className="w-full text-green-600 hover:text-green-700 border-green-200 bg-green-50/50 dark:bg-green-900/10">
                    Викупити: {pricing.buyNow.toLocaleString()} {pricing.currency}
                </Button>
            </div>
          </div>

        </div>
      </CardContent>
    </Card>
  );
};
const TestPage = () => {
  return (
    <div>

        <TenderCard 
  id="12-345"
  origin={{ city: "Poznan", zip: "PL-60001", date: "02.11.2025", time: "09:00" }}
  destination={{ city: "Львів", zip: "UA-79000", date: "07.11.2025", time: "15:30" }}
  customs={{ export: "PL-60001, Poznan", import: "UA-80383, Малехів" }}
  cargo={{ type: "Продукти", weight: "21,6т", quantity: "33 палети", items: "продукти" }}
  equipment={{ type: "Тент", loading: "бокове", belts: 8 }}
  pricing={{
    startPrice: 48000,
    step: 500,
    buyNow: 44000,
    myBid: 47000,
    bestBid: 46500,
    currency: "грн",
    currencyEuro: 1157
  }}
  timeLeft="1:25:09"
/>
    </div>
  )
}

export default TestPage
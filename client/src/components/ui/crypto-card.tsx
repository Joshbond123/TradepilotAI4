import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import huobiLogo from "@assets/images_1755525575253.png";
import okxLogo from "@assets/images (2)_1755525575365.png";
import gateioLogo from "@assets/images (1)_1755525575418.png";

interface CryptoCardProps {
  symbol: string;
  name: string;
  buyExchange: string;
  sellExchange: string;
  buyPrice: number;
  sellPrice: number;
  profitPercentage: number;
  volume: number;
  isProfitable?: boolean;
}

export default function CryptoCard({
  symbol,
  name,
  buyExchange,
  sellExchange,
  buyPrice,
  sellPrice,
  profitPercentage,
  volume,
  isProfitable = false,
}: CryptoCardProps) {
  // Calculate profit in dollars (absolute difference)
  const profitInDollars = sellPrice - buyPrice;

  const getCryptoIcon = (symbol: string) => {
    const baseSymbol = symbol.split('/')[0].toLowerCase();
    const iconUrl = `https://assets.coincap.io/assets/icons/${baseSymbol}@2x.png`;
    
    return (
      <div className="w-10 h-10 rounded-full bg-white p-1 flex items-center justify-center">
        <img 
          src={iconUrl} 
          alt={`${symbol} logo`}
          className="w-8 h-8 rounded-full"
          onError={(e) => {
            // Fallback to a generic crypto icon if the specific one fails
            const target = e.target as HTMLImageElement;
            target.src = "https://assets.coincap.io/assets/icons/btc@2x.png";
          }}
        />
      </div>
    );
  };

  const getExchangeIcon = (exchangeName: string) => {
    // Real exchange logo URLs with your provided authentic assets
    const exchangeLogos: { [key: string]: string } = {
      'Binance': 'https://assets.coingecko.com/markets/images/52/small/binance.jpg',
      'Coinbase': 'https://assets.coingecko.com/markets/images/23/small/Coinbase_Coin_Primary.png',
      'Kraken': 'https://assets.coingecko.com/markets/images/29/small/kraken.jpg',
      'Bitfinex': 'https://assets.coingecko.com/markets/images/4/small/BItfinex.png',
      'Huobi': huobiLogo,
      'KuCoin': 'https://assets.coingecko.com/markets/images/61/small/kucoin.jpg',
      'Bybit': 'https://assets.coingecko.com/markets/images/698/small/bybit.jpg',
      'OKX': okxLogo,
      'Gate.io': gateioLogo,
      'Bitget': 'https://assets.coingecko.com/markets/images/540/small/2023-07-25_21.47.16.jpg'
    };

    const logoUrl = exchangeLogos[exchangeName];

    return (
      <div className="w-6 h-6 rounded-full bg-white p-0.5 flex items-center justify-center">
        <img 
          src={logoUrl || `data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='20' height='20'><rect width='20' height='20' fill='%23007DFF' rx='10'/><text x='50%' y='50%' font-family='Arial' font-size='12' fill='white' text-anchor='middle' dy='4'>${exchangeName.charAt(0)}</text></svg>`}
          alt={`${exchangeName} logo`}
          className="w-5 h-5 object-contain rounded-full"
        />
      </div>
    );
  };

  return (
    <Card 
      className={`${
        isProfitable 
          ? "border-crypto-green border-opacity-30 bg-crypto-green bg-opacity-5 profit-flash" 
          : "border-gray-700"
      } bg-crypto-card`}
      data-testid="crypto-card"
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            {getCryptoIcon(symbol)}
            <div>
              <div className="font-semibold" data-testid="crypto-symbol">{symbol}</div>
              <div className="text-sm text-gray-400" data-testid="crypto-name">{name}</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-crypto-green font-bold text-lg" data-testid="profit-dollars">
              +${profitInDollars.toFixed(2)}
            </div>
            <div className="text-sm text-gray-400">Profit</div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="text-gray-400">Buy from</div>
            <div className="flex items-center space-x-2 mb-1">
              {getExchangeIcon(buyExchange)}
              <div className="font-semibold" data-testid="buy-exchange">{buyExchange}</div>
            </div>
            <div className="text-white" data-testid="buy-price">${buyPrice.toLocaleString()}</div>
          </div>
          <div>
            <div className="text-gray-400">Sell to</div>
            <div className="flex items-center space-x-2 mb-1">
              {getExchangeIcon(sellExchange)}
              <div className="font-semibold" data-testid="sell-exchange">{sellExchange}</div>
            </div>
            <div className="text-crypto-green" data-testid="sell-price">${sellPrice.toLocaleString()}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

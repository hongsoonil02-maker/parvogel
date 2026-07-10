import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';

export default function QrCode({ value, size = 160, label }) {
    const [dataUrl, setDataUrl] = useState('');

    useEffect(() => {
        if (!value) return;
        QRCode.toDataURL(value, {
            width: size,
            margin: 2,
            color: { dark: '#0f2c5e', light: '#ffffff' },
            errorCorrectionLevel: 'M',
        })
            .then(setDataUrl)
            .catch(() => setDataUrl(''));
    }, [value, size]);

    if (!dataUrl) return null;

    return (
        <div className="flex flex-col items-center">
            <div className="p-2 bg-white rounded-xl shadow-md border border-gray-200">
                <img src={dataUrl} alt={label || 'QR Code'} width={size} height={size} className="block" />
            </div>
            {label && <p className="mt-2 text-sm font-semibold text-gray-700 text-center">{label}</p>}
        </div>
    );
}

/** Shared payment data: the browser and email must encode exactly the saved amount. */
export function paymentDetails(number:string,total:number){
 if(!/^\d{1,10}$/.test(number)||!Number.isFinite(total)||total<=0||total>9999999.99)throw new Error('Invalid payment');
 const account='7612533598/5500',iban='CZ2955000000007612533598',amount=total.toFixed(2);
 return {account,iban,variableSymbol:number,currency:'CZK' as const,amount,qrPayload:`SPD*1.0*ACC:${iban}*AM:${amount}*CC:CZK*X-VS:${number}*MSG:FOTODARKY ${number}`};
}
export type PaymentDetails=ReturnType<typeof paymentDetails>;

export default async function handler(req, res) {

if(req.method !== "POST"){
return res.status(405).json({error:"Method not allowed"});
}

const {paymentId, txid} = req.body;

res.status(200).json({
completed:true,
paymentId:paymentId,
txid:txid
});

}

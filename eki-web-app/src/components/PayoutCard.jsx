const PayoutCard = ({ payout }) => {
  return (
    <div className="bg-[#1e4d44] p-6 rounded-2xl text-white">
      <div className="flex justify-between items-start mb-6">
        <div className="bg-white/10 p-2 rounded-lg text-lg"></div>
        <span className="text-[10px] bg-white/20 px-2 py-1 rounded uppercase font-bold tracking-widest">Verified</span>
      </div>
      <p className="text-white/70 text-sm">Last Payout</p>
      <h2 className="text-3xl font-bold mt-1">${payout?.amount || '0.00'}</h2>
      <div className="flex justify-between items-center mt-6">
        <span className="text-white/60 text-xs italic">Paid on {payout?.date || 'N/A'}</span>
        <button className="text-xs font-bold underline hover:text-emerald-300">View History</button>
      </div>
    </div>
  );
};
export default PayoutCard;
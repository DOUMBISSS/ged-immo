// middleware/checkSubscription.js
export const checkSubscription = (req, res, next) => {
  const user = req.user; // injecté par authenticate JWT

  if (!user.subscription || !user.subscription.endDate) {
    return res.status(403).json({ message: "Abonnement non défini." });
  }

  const now = new Date();
  const end = new Date(user.subscription.endDate);

  if (now > end) {
    return res.status(403).json({ message: "Abonnement expiré. Merci de renouveler." });
  }

  next();
};
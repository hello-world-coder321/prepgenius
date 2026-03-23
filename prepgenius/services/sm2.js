// SM-2 Algorithm + Ebbinghaus forgetting curve

function sm2(topic, q) {
    q = Math.max(0, Math.min(5, q));
    let { easeFactor, interval, repetitions } = topic;
  
    if (q < 3) {
      repetitions = 0;
      interval = 1;
    } else {
      if (repetitions === 0) interval = 1;
      else if (repetitions === 1) interval = 6;
      else interval = Math.round(interval * easeFactor);
      repetitions++;
      easeFactor = Math.max(1.3, easeFactor + 0.1 - (5 - q) * (0.08 + (5 - q) * 0.02));
    }
  
    const nextDue = new Date(Date.now() + interval * 86400000);
    return { easeFactor, interval, repetitions, lastStudied: new Date(), nextDue };
  }
  
  function retention(topic, atTime = Date.now()) {
    const daysSince = (atTime - new Date(topic.lastStudied)) / 86400000;
    const S = Math.max(0.5, topic.interval * 0.7);
    return Math.max(0.02, Math.exp(-daysSince / S));
  }
  
  function retentionPercent(topic, atTime) {
    return Math.round(retention(topic, atTime) * 100);
  }
  
  function urgency(topic) {
    const ret = retentionPercent(topic);
    const overdue = Date.now() > new Date(topic.nextDue);
    if (overdue && ret < 40) return 'critical';
    if (overdue || ret < 55) return 'soon';
    if (ret < 75) return 'ok';
    return 'strong';
  }
  
  module.exports = { sm2, retention, retentionPercent, urgency };
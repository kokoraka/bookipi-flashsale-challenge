-- PARAMS
-- KEYS[1]  = stock counter, e.g: "inventory:01a1dd34-b2fc-7fa1-b7e1-b98267225dfa"
-- KEYS[2]  = per-user dedupe set, e.g: "flashsale:01a1dd34-b2fc-7fa1-b7e1-b98267225dfa"
-- ARGV[1]  = user id, e.g: "raka.suryaardi@gmail.com"
-- ARGV[2]  = per-user limit, e.g: 1
-- RETURNS
-- SUCCESS = 1
-- SOLD OUT = -1
-- LIMIT = -2
local stock = tonumber(redis.call('GET', KEYS[1]))
if not stock or stock <= 0 then
  return {-1}
end
local already = redis.call('SISMEMBER', KEYS[2], ARGV[1])
if already == 1 then
  return {-2}
end
redis.call('DECR', KEYS[1])
redis.call('SADD', KEYS[2], ARGV[1])
return {1}
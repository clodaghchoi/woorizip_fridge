import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
export const supabase = createClient(url, key);

// 냉장고 데이터 불러오기 (없으면 null)
export async function dbLoad(code) {
  const { data, error } = await supabase
    .from("fridges").select("data").eq("code", code).maybeSingle();
  if (error) { console.error(error); return null; }
  return data ? data.data : null;
}

// 새 냉장고 만들기
export async function dbInsert(code, initial) {
  const { error } = await supabase.from("fridges").insert({ code, data: initial });
  if (error) console.error(error);
}

// 저장
export async function dbSave(code, dataObj) {
  const { error } = await supabase
    .from("fridges")
    .update({ data: dataObj, updated_at: new Date().toISOString() })
    .eq("code", code);
  if (error) console.error(error);
}

// 실시간 구독 (다른 사람이 바꾸면 콜백 호출)
export function dbSubscribe(code, cb) {
  const channel = supabase
    .channel("fridge-" + code)
    .on(
      "postgres_changes",
      { event: "UPDATE", schema: "public", table: "fridges", filter: "code=eq." + code },
      (payload) => { if (payload.new && payload.new.data) cb(payload.new.data); }
    )
    .subscribe();
  return () => { supabase.removeChannel(channel); };
}
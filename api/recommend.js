export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { inventory, cuisine, topCooked } = req.body || {};
  const cuisineText = cuisine === "다양하게" ? "한식과 양식 등 다양하게" : cuisine;

  const prompt = `다음은 우리집 냉장고 재고야:
${inventory || "(비어있음)"}

우리가 자주 해먹는 요리: ${topCooked || "아직 기록 없음"}
요리 스타일 선호: ${cuisineText}

이 재고를 보고 아래 형식의 JSON만 출력해줘. 마크다운, 설명, 백틱 없이 순수 JSON 객체 하나만.
{
  "canMakeNow": [ {"emoji":"🍲","name":"요리이름","desc":"한 줄 설명","uses":["재료1","재료2"],"usesExpiring":["곧상하는재료"]} ],
  "almostThere": [ {"emoji":"🍝","name":"요리이름","desc":"한 줄 설명","uses":["가진재료"],"missing":["사야할재료"]} ],
  "newIdeas": [ {"emoji":"🥬","ingredient":"새재료","recipe":"만들수있는요리","desc":"한 줄 설명","combinesWith":["기존재료1","기존재료2"]} ]
}
규칙:
- canMakeNow: 현재 재고만으로 가능한 요리, 최대 4개. 자주 해먹는 요리 중 가능한 게 있으면 우선, 유통기한 임박 재료 쓰는 요리도 우선.
- almostThere: 1~2가지만 더 사면 되는 요리, 최대 3개. missing에는 사야 할 재료만.
- newIdeas: 새 재료 하나를 추천하고 기존 재고와 조합하는 아이디어, 최대 2개.
- 요리 이름은 유튜브·레시피 검색에 잘 걸리는 일반 명칭으로. 모든 텍스트는 한국어, desc는 짧고 친근하게.
- 재고가 비어있으면 canMakeNow와 almostThere는 빈 배열, newIdeas로 기본 장보기 추천.`;

  try {
    const r = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" +
        process.env.GEMINI_API_KEY,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: "application/json", temperature: 0.7 },
        }),
      }
    );
    const j = await r.json();
    const text = j?.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
    res.status(200).json(JSON.parse(text));
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "recommend failed" });
  }
}
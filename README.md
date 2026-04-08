# LLM-Driven Geolocation Extraction for Real-Time Disaster Monitoring

> Transform unstructured disaster reports into structured, GIS-ready intelligence — automatically.

This system uses a two-stage LLM pipeline to extract structured data from disaster narratives (news articles, situation reports, ReliefWeb dispatches). It detects which fields are present, retrieves relevant context via RAG, and extracts values with source quotes — producing structured JSON ready for mapping and analysis.

---

## Explore Further

| Resource | Link |
|---|---|
| 🗺️ Interactive StoryMap | [ArcGIS StoryMap](https://storymaps.arcgis.com/stories/64b3b4b232824139be54645097e448de) |
| 🤗 Live Web Demo | [HuggingFace Space](https://huggingface.co/spaces/YibinGao/LLM_IE) |

---

## Why It Works

Tested on **1,587 multi-hazard ReliefWeb reports** · Best config: RAG + 2-shot prompting

| Metric | Score | Config |
|---|---|---|
| Field-level F1 | **0.91** | RAG-enhanced, 2-shot |
| Overall Accuracy | **0.88** | Value extraction |
| Geographic F1 | **0.98** | Location field detection |
| Usability Rate | **89.6%** | 1,368 of 1,526 records |

### Dual-Layer Validation *(exploratory — not evaluated in the paper)*

<table>
<tr>
<td width="50%">

**Rule-based Validator**
- Field presence & date format
- Non-negative values
- Auto-retry with error feedback

</td>
<td width="50%">

**LLM Validator**
- Geo entity & admin level errors
- Taxonomy alignment
- Household conversion (UNDP ×5/×3)

</td>
</tr>
</table>

---

## How It Works

| Step | | Description |
|---|---|---|
| **01** | Input Disaster Text | Paste any disaster report — news article, situation report, or ReliefWeb dispatch. |
| **02** | Schema-Guided Extraction | Two-stage LLM pipeline detects present fields, then extracts values with source quotes. |
| **03** | Validate & Explore | Review, edit, and add to the live dashboard. |

### Pipeline

```
Disaster Text
      │
      ▼
┌─────────────────┐
│  Field Detection │  ◄── Schema definitions + 2 few-shot examples
│  (Stage 1 · LLM) │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  RAG Retrieval   │  ◄── Field definitions · Category vocab · Matched examples
│  (FAISS search)  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Value Extraction │  ◄── Detected fields + Retrieved context + Source quotes
│  (Stage 2 · LLM) │
└────────┬────────┘
         │
         ▼
  Structured JSON (+ source spans)
```

---

## Where It Applies

| Domain | Use Cases |
|---|---|
| 📢 **Public Opinion & Crisis Communication** | Monitor news & social media at scale · Extract event framing & affected groups · Track sentiment and impact signals |
| 🌿 **Environmental Monitoring** | Structure field reports & remote-sensing data · Build wildfire / flood / drought datasets · Enable long-term trend analysis |
| 🛡️ **Conflict & Security Analysis** | Convert situation reports to structured records · Support incident mapping & pattern detection · Feed early-warning systems |

/**
 * Gemini API 響應解析工具
 * 處理各種可能的響應格式
 */

export interface GeminiResponse {
  candidates?: Array<{
    content?: {
      parts?: Array<{ text?: string }>
      role?: string
    }
    finishReason?: string
    index?: number
  }>
  usageMetadata?: any
  modelVersion?: string
  responseId?: string
}

/**
 * 從 Gemini 響應中提取文本內容
 */
export function extractTextFromGeminiResponse(response: any): string {
  try {
    if (!response) {
      throw new Error('響應為空')
    }

    // 檢查響應結構
    const candidates = response.candidates
    if (!candidates || !Array.isArray(candidates) || candidates.length === 0) {
      console.error('❌ Invalid response structure:', JSON.stringify(response, null, 2))
      throw new Error('響應結構無效：缺少candidates')
    }

    const firstCandidate = candidates[0]
    if (!firstCandidate || !firstCandidate.content) {
      console.error('❌ Invalid candidate structure:', JSON.stringify(firstCandidate, null, 2))
      throw new Error('響應結構無效：缺少content')
    }

    const parts = firstCandidate.content.parts
    if (!parts || !Array.isArray(parts) || parts.length === 0) {
      console.error('❌ Invalid parts structure:', JSON.stringify(firstCandidate.content, null, 2))
      throw new Error('響應結構無效：缺少parts')
    }

    // 合併所有text部分
    const textContent = parts
      .map(part => part?.text || '')
      .join('')
      .trim()

    if (!textContent) {
      throw new Error('響應內容為空')
    }

    return textContent
  } catch (error: any) {
    console.error('❌ Extract text failed:', error.message)
    throw error
  }
}

/**
 * 強大的JSON解析函數，支持多種格式
 */
export function parseJsonFromText(text: string): any {
  console.log('🔍 Parsing text (first 300 chars):', JSON.stringify(text.substring(0, 300)))
  console.log('🔍 Full text length:', text.length)

  if (!text || typeof text !== 'string') {
    throw new Error('輸入文本為空或無效')
  }

  const cleanText = text.trim()
  console.log('🔍 Clean text length:', cleanText.length)

  // 方法1: 嘗試直接解析
  try {
    const directParse = JSON.parse(cleanText)
    console.log('✅ Direct JSON parse successful')
    return directParse
  } catch (error) {
    console.log('❌ Direct JSON parse failed:', error)
  }

  // 方法2: 提取markdown包裹的JSON
  try {
    const markdownMatch = cleanText.match(/```(?:json)?\s*([\s\S]*?)\s*```/)
    if (markdownMatch) {
      const jsonContent = markdownMatch[1].trim()
      const result = JSON.parse(jsonContent)
      console.log('✅ Markdown JSON parse successful')
      return result
    }
  } catch (error) {
    console.log('❌ Markdown JSON parse failed:', error)
  }

  // 方法3: 查找第一個完整的JSON對象
  try {
    const jsonMatch = cleanText.match(/\{[\s\S]*?\}/)
    if (jsonMatch) {
      const jsonContent = jsonMatch[0]
      const result = JSON.parse(jsonContent)
      console.log('✅ Pattern JSON parse successful')
      return result
    }
  } catch (error) {
    console.log('❌ Pattern JSON parse failed:', error)
  }

  // 方法4: 查找多行JSON（更寬鬆的匹配）
  try {
    const lines = cleanText.split('\n')
    let jsonStart = -1
    let jsonEnd = -1
    let braceCount = 0

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim()
      if (line.includes('{')) {
        if (jsonStart === -1) jsonStart = i
        braceCount += (line.match(/\{/g) || []).length
        braceCount -= (line.match(/\}/g) || []).length
      }
      if (line.includes('}')) {
        braceCount -= (line.match(/\}/g) || []).length
        braceCount += (line.match(/\{/g) || []).length
        if (braceCount === 0 && jsonStart !== -1) {
          jsonEnd = i
          break
        }
      }
    }

    if (jsonStart !== -1 && jsonEnd !== -1) {
      const jsonContent = lines.slice(jsonStart, jsonEnd + 1).join('\n')
      const result = JSON.parse(jsonContent)
      console.log('✅ Multiline JSON parse successful')
      return result
    }
  } catch (error) {
    console.log('❌ Multiline JSON parse failed:', error)
  }

  // 方法5: 嘗試修復常見的JSON問題
  try {
    let fixedText = cleanText
    // 移除前後不相關文字
    const possibleStart = Math.max(
      fixedText.indexOf('{'),
      fixedText.indexOf('[')
    )
    const possibleEnd = Math.max(
      fixedText.lastIndexOf('}'),
      fixedText.lastIndexOf(']')
    )

    if (possibleStart !== -1 && possibleEnd !== -1 && possibleEnd > possibleStart) {
      fixedText = fixedText.substring(possibleStart, possibleEnd + 1)
      
      // 修復常見問題
      fixedText = fixedText
        .replace(/,\s*}/g, '}')  // 移除尾部逗號
        .replace(/,\s*]/g, ']')  // 移除數組尾部逗號
        .replace(/'/g, '"')      // 替換單引號
        .replace(/\n/g, ' ')     // 移除換行
        .replace(/\t/g, ' ')     // 移除tab
        .replace(/\s+/g, ' ')    // 壓縮空格

      const result = JSON.parse(fixedText)
      console.log('✅ Fixed JSON parse successful')
      return result
    }
  } catch (error) {
    console.log('❌ Fixed JSON parse failed:', error)
  }

  // 全部失敗
  console.error('❌ All JSON parsing methods failed for text:', cleanText)
  throw new Error(`無法解析JSON內容: ${cleanText.length > 200 ? cleanText.substring(0, 200) + '...' : cleanText}`)
}

/**
 * 完整的Gemini響應解析流程
 */
export function parseGeminiResponse<T = any>(response: any): T {
  try {
    // 1. 提取文本
    const textContent = extractTextFromGeminiResponse(response)
    
    // 2. 解析JSON
    const jsonData = parseJsonFromText(textContent)
    
    return jsonData as T
  } catch (error: any) {
    console.error('❌ Gemini response parsing failed:', error.message)
    throw new Error(`響應解析失敗: ${error.message}`)
  }
}
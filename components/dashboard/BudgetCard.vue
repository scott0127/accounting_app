<template>
  <div class="bg-white rounded-xl shadow-sm p-4">
    <h3 class="text-base font-semibold mb-3">剩餘預算</h3>
    <div class="flex flex-col items-center h-auto relative pb-4">
      <!-- 綜合預算顯示 -->
      <div class="relative w-40 h-40 flex items-center justify-center mb-2">
        <!-- 百分比環形進度 -->
        <svg class="absolute inset-0 w-full h-full transform -rotate-90">
          <circle
            cx="80"
            cy="80"
            r="70"
            stroke="rgba(229, 231, 235, 0.5)"
            stroke-width="8"
            fill="none"
          />
          <circle
            cx="80"
            cy="80"
            r="70"
            :stroke="budgetCircleColor"
            stroke-width="8"
            stroke-linecap="round"
            fill="none"
            :stroke-dasharray="circleValue"
            class="budget-circle-animation"
          />
        </svg>
        
        <!-- 玻璃容器 -->
        <div class="container-shape relative z-10">
          <div class="container-inner">
            <!-- 刻度線 -->
            <div class="measurement-lines">
              <template v-for="i in 5" :key="i">
                <div class="measurement-line" :style="{ opacity: (i/5) }">
                  <span class="measurement-text">{{ (100 - i * 20) }}%</span>
                </div>
              </template>
            </div>

            <!-- 水滴效果 -->
            <div class="droplet" style="left: 30%; top: 20%"></div>
            <div class="droplet" style="left: 50%; top: 15%; animation-delay: 0.5s"></div>
            <div class="droplet" style="left: 70%; top: 25%; animation-delay: 1s"></div>

            <!-- 水體效果 -->
            <div class="water-body"
              :style="{ 
                height: heightPercentage,
                transition: 'all 1s cubic-bezier(0.4, 0, 0.2, 1)'
              }">
              <div class="wave wave-back"></div>
              <div class="wave wave-front"></div>
            </div>
            
            <!-- 懸浮金額顯示 -->
            <div class="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <div class="budget-display p-2 rounded-lg backdrop-blur">
                <span class="text-md font-bold" :class="budgetTextColor">
                  {{ formattedRemaining }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 預算狀態與設定 -->
      <div class="mt-2 text-center w-full z-20 relative">
        <div class="p-2 rounded-lg mb-2" :class="budgetStatusClass">
          <p class="text-xs font-medium" :class="budgetTextColor">
            {{ budgetStatus }}
          </p>
        </div>
        
        <button 
          @click="$emit('show-budget-modal')"
          class="w-full px-3 py-1.5 text-xs bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          設定預算
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps({
  budgetCircleColor: {
    type: String,
    required: true
  },
  circleValue: {
    type: String,
    required: true
  },
  heightPercentage: {
    type: String,
    required: true
  },
  budgetTextColor: {
    type: String,
    required: true
  },
  formattedRemaining: {
    type: String,
    required: true
  },
  budgetStatusClass: {
    type: String,
    required: true
  },
  budgetStatus: {
    type: String,
    required: true
  }
})

defineEmits(['show-budget-modal'])
</script>

<style scoped>
.container-shape {
  position: relative;
  width: 100px;
  height: 100px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  backdrop-filter: blur(5px);
  border: 2px solid rgba(255, 255, 255, 0.2);
  box-shadow: 
    inset 0 0 15px rgba(255, 255, 255, 0.2),
    0 4px 10px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.container-inner {
  position: absolute;
  inset: 0;
  overflow: hidden;
  border-radius: 50%;
}

.measurement-lines {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 10px;
  width: 1px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 10px 0;
}

.measurement-line {
  width: 6px;
  height: 1px;
  background: rgba(255, 255, 255, 0.3);
}

.measurement-text {
  position: absolute;
  left: 15px;
  font-size: 7px;
  color: rgba(255, 255, 255, 0.6);
  transform: translateY(-50%);
}

.water-body {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 200%;
  transition: all 1s ease;
  border-radius: 0 0 8px 8px;
}

.wave {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 100%;
  animation: waterWave 3s infinite linear;
  transform-origin: center bottom;
}

.wave-front {
  background: linear-gradient(180deg, 
    rgba(0, 153, 255, 0.7) 0%,
    rgba(0, 153, 255, 0.3) 100%
  );
}

.wave-back {
  background: linear-gradient(180deg, 
    rgba(0, 153, 255, 0.4) 0%,
    rgba(0, 153, 255, 0.1) 100%
  );
  animation-delay: 0.5s;
}

@keyframes waterWave {
  0% {
    transform: translateX(-50%) translateZ(0) scaleY(1);
  }
  50% {
    transform: translateX(-30%) translateZ(0) scaleY(0.95);
  }
  100% {
    transform: translateX(-50%) translateZ(0) scaleY(1);
  }
}

.droplet {
  position: absolute;
  width: 4px;
  height: 4px;
  background: rgba(0, 153, 255, 0.6);
  border-radius: 50%;
  animation: droplet 2s infinite;
}

@keyframes droplet {
  0% {
    transform: translateY(-20px) scale(1);
    opacity: 0;
  }
  50% {
    transform: translateY(0) scale(1);
    opacity: 1;
  }
  100% {
    transform: translateY(10px) scale(0.5);
    opacity: 0;
  }
}

.budget-display {
  background: rgba(255, 255, 255, 0.15);
  border-radius: 10px;
  backdrop-filter: blur(5px);
  padding: 3px 8px;
  box-shadow: 0 3px 4px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
  transition: transform 0.3s ease;
}

.budget-display:hover {
  transform: translateY(-4px);
}

.budget-circle-animation {
  transition: stroke-dasharray 1.5s cubic-bezier(0.4, 0, 0.2, 1);
  transform-origin: center;
}
</style> 
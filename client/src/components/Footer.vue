<template>
  <footer class="bg-secondary-800 text-white mt-16">
    <div class="container mx-auto px-4 py-12">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <h3 class="text-xl font-bold mb-4">宝得利门窗</h3>
          <p class="text-secondary-300 text-sm">
            专业门窗制造商，为您提供高品质的门窗产品和优质的服务。
          </p>
        </div>
        
        <div>
          <h4 class="font-semibold mb-4">产品分类</h4>
          <ul class="space-y-2 text-sm">
            <li><router-link to="/?primaryCategory=门" class="text-secondary-300 hover:text-white transition-colors flex items-center">
              <span class="mr-1"></span> 门类产品
            </router-link></li>
            <li><router-link to="/?primaryCategory=窗户" class="text-secondary-300 hover:text-white transition-colors flex items-center">
              <span class="mr-1"></span> 窗户类产品
            </router-link></li>
            <li><router-link to="/?primaryCategory=其他配件" class="text-secondary-300 hover:text-white transition-colors flex items-center">
              <span class="mr-1"></span> 其他配件
            </router-link></li>
          
          </ul>
        </div>
        
        <div>
          <h4 class="font-semibold mb-4">客户服务</h4>
          <ul class="space-y-2 text-sm">
            <li><span class="text-secondary-300">专业测量</span></li>
            <li><span class="text-secondary-300">免费设计</span></li>
            <li><span class="text-secondary-300">上门安装</span></li>
            <li><span class="text-secondary-300">售后保障</span></li>
            <li><span class="text-secondary-300">质量保证</span></li>
          </ul>
        </div>
        
        <div>
          <h4 class="font-semibold mb-4">联系信息</h4>
          <div class="space-y-2 text-sm text-secondary-300">
            <div>
              <p class="font-medium text-secondary-200 mb-1">联系电话</p>
              <p><a href="tel:18960805927" class="hover:text-white transition-colors">189-6080-5927</a></p>
              <p><a href="tel:13134509296" class="hover:text-white transition-colors">131-3450-9296</a></p>
            </div>
            <div>
              <p class="font-medium text-secondary-200 mb-1">邮箱地址</p>
              <p><a href="mailto:2039017996@qq.com" class="hover:text-white transition-colors">2039017996@qq.com</a></p>
            </div>
            <div>
              <p class="font-medium text-secondary-200 mb-1">门店地址</p>
              <p>福建省福州市福清市</p>
            </div>
          </div>
        </div>
      </div>
      
      <div class="border-t border-secondary-700 mt-8 pt-8 text-center text-sm text-secondary-400">
        <p>&copy; 2024 宝得利门窗. 版权所有.</p>
      </div>
    </div>
  </footer>
</template> 
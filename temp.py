import requests
from bs4 import BeautifulSoup
import re
from typing import List, Dict


class RosskoCartParser:
    """Парсер корзины сайта Росско"""
    
    def __init__(self, html_content: str = None, url: str = None):
        """
        Инициализация парсера
        
        Args:
            html_content: HTML-контент страницы
            url: URL страницы корзины (для авторизации может потребоваться сессия)
        """
        self.html_content = html_content
        self.url = url
        self.soup = None
        
    def load_html(self, html_content: str):
        """Загрузка HTML-контента"""
        self.html_content = html_content
        self.soup = BeautifulSoup(html_content, 'html.parser')
    
    def parse_cart_items(self) -> List[Dict]:
        """
        Парсинг товаров из корзины
        
        Returns:
            Список словарей с информацией о товарах
        """
        
        if not self.soup:
            self.soup = BeautifulSoup(self.html_content, 'html.parser')
        
        items = []
        
        # Находим все элементы корзины по классу
        cart_items = self.soup.find_all('div', class_=re.compile(r'CartItemNew.*root'))
        
        for item in cart_items:
            item_data = self._parse_single_item(item)
            if item_data:
                items.append(item_data)
        
        return items
    
    def _parse_single_item(self, item_element) -> Dict:
        """Парсинг одного элемента корзины"""
        try:
            # Бренд
            brand_elem = item_element.find('div', class_=re.compile(r'brand'))
            brand = brand_elem.get_text(strip=True) if brand_elem else None
            
            # Артикул
            part_number_elem = item_element.find('div', class_=re.compile(r'partsNumber'))
            part_number = None
            if part_number_elem:
                link = part_number_elem.find('a')
                part_number = link.get_text(strip=True) if link else None
            
            # Наименование
            name_elem = item_element.find('div', class_=re.compile(r'name__'))
            name = name_elem.get_text(strip=True) if name_elem else None
            
            # Доставка
            delivery_info = self._parse_delivery(item_element)
            
            # Цены
            prices = self._parse_prices(item_element)
            
            # Количество
            quantity = self._parse_quantity(item_element)
            
            # Общая стоимость
            total_elem = item_element.find('div', class_=re.compile(r'total'))
            total = self._extract_price(total_elem.get_text(strip=True)) if total_elem else None
            
            return {
                'brand': brand,
                'part_number': part_number,
                'name': name,
                'delivery': delivery_info,
                'prices': prices,
                'quantity': quantity,
                'total': total
            }
            
        except Exception as e:
            print(f"Ошибка при парсинге элемента: {e}")
            return {}
    
    def _parse_delivery(self, item_element) -> Dict:
        """Парсинг информации о доставке"""
        try:
            delivery_elem = item_element.find('div', class_=re.compile(r'delivery'))
            
            if delivery_elem:
                # Дата доставки
                delivery_date = None
                time_elems = delivery_elem.find_all('div', class_=re.compile(r'deliveryTime|time'))
                
                if time_elems:
                    # Извлекаем время
                    time_parts = []
                    for elem in time_elems:
                        time_parts.append(elem.get_text(strip=True))
                    
                    delivery_date = ' '.join(time_parts)
                
                # Склад
                warehouse_elem = delivery_elem.find('div', class_=re.compile(r'content'))
                warehouse = warehouse_elem.get_text(strip=True) if warehouse_elem else None
                
                return {
                    'date': delivery_date,
                    'warehouse': warehouse
                }
            
            return {}
            
        except Exception as e:
            print(f"Ошибка при парсинге доставки: {e}")
            return {}
    
    def _parse_prices(self, item_element) -> Dict:
        """Парсинг цен"""
        try:
            price_elem = item_element.find('div', class_=re.compile(r'price'))
            
            if price_elem:
                # Старая цена (зачеркнутая)
                overprice_elem = price_elem.find('span', class_=re.compile(r'overprice'))
                overprice = self._extract_price(overprice_elem.get_text(strip=True)) if overprice_elem else None
                
                # Текущая цена
                default_price_elem = price_elem.find('span', class_=re.compile(r'defaultPrice'))
                default_price = self._extract_price(default_price_elem.get_text(strip=True)) if default_price_elem else None
                
                return {
                    'original': overprice,
                    'current': default_price
                }
            
            return {}
            
        except Exception as e:
            print(f"Ошибка при парсинге цен: {e}")
            return {}
    
    def _parse_quantity(self, item_element) -> Dict:
        """Парсинг количества"""
        try:
            count_elem = item_element.find('div', class_=re.compile(r'count'))
            
            if count_elem:
                # Текущее количество
                input_elem = count_elem.find('input', class_=re.compile(r'input'))
                current_qty = int(input_elem.get('value')) if input_elem else 1
                
                # Доступное количество
                tooltip_elem = count_elem.find('div', class_=re.compile(r'tooltip'))
                available_qty = None
                
                if tooltip_elem:
                    tooltip_text = tooltip_elem.get_text(strip=True)
                    # Извлекаем число из текста "В наличии только4 шт."
                    match = re.search(r'(\d+)', tooltip_text)
                    if match:
                        available_qty = int(match.group(1))
                
                return {
                    'current': current_qty,
                    'available': available_qty
                }
            
            return {}
            
        except Exception as e:
            print(f"Ошибка при парсинге количества: {e}")
            return {}
    
    def _extract_price(self, price_str: str) -> float:
        """Извлечение цены из строки"""
        try:
            # Удаляем символы валюты и пробелы, заменяем запятую на точку
            cleaned = re.sub(r'[^\d,]', '', price_str).replace(',', '.')
            return float(cleaned) if cleaned else 0.0
        except:
            return 0.0
    
    def get_cart_summary(self) -> Dict:
        """Получение общей информации о корзине"""
        if not self.soup:
            self.soup = BeautifulSoup(self.html_content, 'html.parser')
        
        summary = {}
        
        # Общая сумма
        total_elem = self.soup.find(string=re.compile(r'\d+\s*\d+,\d+'))
        if total_elem:
            summary['total_amount'] = self._extract_price(total_elem)
        
        # Количество товаров
        items = self.parse_cart_items()
        summary['items_count'] = len(items)
        
        return summary


# Пример использования
def main():
    # Вариант 1: Парсинг из файла
    with open('Росско — Корзина.html', 'r', encoding='utf-8') as f:
        html_content = f.read()
    
    parser = RosskoCartParser(html_content=html_content)
    cart_items = parser.parse_cart_items()
    
    print(f"Найдено товаров: {len(cart_items)}\n")
    
    for i, item in enumerate(cart_items, 1):
        print(f"Товар #{i}:")
        print(f"  Бренд: {item['brand']}")
        print(f"  Артикул: {item['part_number']}")
        print(f"  Наименование: {item['name']}")
        print(f"  Доставка: {item['delivery'].get('date', 'Не указана')}")
        print(f"  Склад: {item['delivery'].get('warehouse', 'Не указан')}")
        print(f"  Цена: {item['prices'].get('current', 0)} ₽ (старая: {item['prices'].get('original', 0)} ₽)")
        print(f"  Количество: {item['quantity'].get('current', 0)} (доступно: {item['quantity'].get('available', 'Неизвестно')})")
        print(f"  Итого: {item['total']} ₽")
        print("-" * 50)
    
    # Общая информация
    summary = parser.get_cart_summary()
    print(f"\nОбщая сумма корзины: {summary.get('total_amount', 0)} ₽")
    print(f"Всего товаров: {summary.get('items_count', 0)}")


if __name__ == "__main__":
    main()
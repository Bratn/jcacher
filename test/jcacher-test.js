jCacher.CacheItem.defaults.sliding = 120;
jCacher.CacheItem.defaults.absolute = null;

test('and, remove and count', function () {

	var myKey1='myKey1',
		myValue1='myValue1',
		myKey2 = 'myKey2',
		myValue2 = 'myValue2';
	
	jCacher.add(myKey1, myValue1);
	ok(jCacher.count === 1, 'Count is 1')
	
	jCacher.add(myKey1, myValue1);
	ok(jCacher.count === 1, 'Count is still 1')
	
	jCacher.add(myKey2, myValue2);
	ok(jCacher.count === 2, 'Count is now 2');
	
	var success = jCacher.remove(myKey1);
	ok(jCacher.count === 1, 'Count is back on 1');
	
	var itemsRemoved = jCacher.reset();
	ok(jCacher.count === 0, 'Count is back on 0');
	
});

test('add remove and get', function(){
	
	var myKey1='myKey1',
		myValue1='myValue1',
		myKey2 = 'myKey2',
		myValue2 = 'myValue2';
		
	ok(typeof jCacher.add(myKey1, myValue1) == 'undefined', 'Item added');
	
	jCacher.add(myKey2, myValue2);
	
	ok(jCacher.get(myKey1) === myValue1, 'Retrieved same and right value');
	
	var removed = jCacher.remove(myKey1);
	ok(removed, 'Item removed successfully');
	
	ok(jCacher.get(myKey1) === null, 'Removed item returned null');
	
});


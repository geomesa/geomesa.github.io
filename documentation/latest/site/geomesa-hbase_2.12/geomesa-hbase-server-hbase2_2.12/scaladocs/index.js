Index.PACKAGES = {"org.locationtech" : [], "org.locationtech.geomesa" : [], "org.locationtech.geomesa.hbase.server" : [], "org.locationtech.geomesa.hbase.server.coprocessor" : [{"name" : "org.locationtech.geomesa.hbase.server.coprocessor.GeoMesaCoprocessor", "shortDescription" : "Server-side coprocessor implementation for HBase 2.2", "members_class" : [{"label" : "getScanner", "tail" : "(scan: Scan): RegionScanner", "member" : "org.locationtech.geomesa.hbase.server.coprocessor.GeoMesaCoprocessor.getScanner", "link" : "org\/locationtech\/geomesa\/hbase\/server\/coprocessor\/GeoMesaCoprocessor.html#getScanner(scan:org.apache.hadoop.hbase.client.Scan):org.apache.hadoop.hbase.regionserver.RegionScanner", "kind" : "def"}, {"label" : "getResult", "tail" : "(controller: RpcController, request: GeoMesaCoprocessorRequest, done: RpcCallback[GeoMesaCoprocessorResponse]): Unit", "member" : "org.locationtech.geomesa.hbase.server.coprocessor.GeoMesaCoprocessor.getResult", "link" : "org\/locationtech\/geomesa\/hbase\/server\/coprocessor\/GeoMesaCoprocessor.html#getResult(controller:com.google.protobuf.RpcController,request:org.locationtech.geomesa.hbase.proto.GeoMesaProto.GeoMesaCoprocessorRequest,done:com.google.protobuf.RpcCallback[org.locationtech.geomesa.hbase.proto.GeoMesaProto.GeoMesaCoprocessorResponse]):Unit", "kind" : "def"}, {"label" : "start", "tail" : "(env: CoprocessorEnvironment[_ <: Coprocessor]): Unit", "member" : "org.locationtech.geomesa.hbase.server.coprocessor.GeoMesaCoprocessor.start", "link" : "org\/locationtech\/geomesa\/hbase\/server\/coprocessor\/GeoMesaCoprocessor.html#start(env:org.apache.hadoop.hbase.CoprocessorEnvironment[_<:org.apache.hadoop.hbase.Coprocessor]):Unit", "kind" : "def"}, {"label" : "getServices", "tail" : "(): Iterable[Service]", "member" : "org.locationtech.geomesa.hbase.server.coprocessor.GeoMesaCoprocessor.getServices", "link" : "org\/locationtech\/geomesa\/hbase\/server\/coprocessor\/GeoMesaCoprocessor.html#getServices():Iterable[com.google.protobuf.Service]", "kind" : "def"}, {"member" : "org.locationtech.geomesa.hbase.server.coprocessor.GeoMesaCoprocessor#<init>", "error" : "unsupported entity"}, {"label" : "execute", "tail" : "(controller: RpcController, request: GeoMesaCoprocessorRequest, done: RpcCallback[GeoMesaCoprocessorResponse]): Unit", "member" : "org.locationtech.geomesa.hbase.server.common.CoprocessorScan.execute", "link" : "org\/locationtech\/geomesa\/hbase\/server\/coprocessor\/GeoMesaCoprocessor.html#execute(controller:com.google.protobuf.RpcController,request:org.locationtech.geomesa.hbase.proto.GeoMesaProto.GeoMesaCoprocessorRequest,done:com.google.protobuf.RpcCallback[org.locationtech.geomesa.hbase.proto.GeoMesaProto.GeoMesaCoprocessorResponse]):Unit", "kind" : "def"}, {"label" : "logger", "tail" : ": Logger", "member" : "com.typesafe.scalalogging.StrictLogging.logger", "link" : "org\/locationtech\/geomesa\/hbase\/server\/coprocessor\/GeoMesaCoprocessor.html#logger:com.typesafe.scalalogging.Logger", "kind" : "val"}, {"label" : "getBulkLoadObserver", "tail" : "(): Optional[BulkLoadObserver]", "member" : "org.apache.hadoop.hbase.coprocessor.RegionCoprocessor.getBulkLoadObserver", "link" : "org\/locationtech\/geomesa\/hbase\/server\/coprocessor\/GeoMesaCoprocessor.html#getBulkLoadObserver():java.util.Optional[org.apache.hadoop.hbase.coprocessor.BulkLoadObserver]", "kind" : "def"}, {"label" : "getEndpointObserver", "tail" : "(): Optional[EndpointObserver]", "member" : "org.apache.hadoop.hbase.coprocessor.RegionCoprocessor.getEndpointObserver", "link" : "org\/locationtech\/geomesa\/hbase\/server\/coprocessor\/GeoMesaCoprocessor.html#getEndpointObserver():java.util.Optional[org.apache.hadoop.hbase.coprocessor.EndpointObserver]", "kind" : "def"}, {"label" : "getRegionObserver", "tail" : "(): Optional[RegionObserver]", "member" : "org.apache.hadoop.hbase.coprocessor.RegionCoprocessor.getRegionObserver", "link" : "org\/locationtech\/geomesa\/hbase\/server\/coprocessor\/GeoMesaCoprocessor.html#getRegionObserver():java.util.Optional[org.apache.hadoop.hbase.coprocessor.RegionObserver]", "kind" : "def"}, {"label" : "stop", "tail" : "(arg0: CoprocessorEnvironment[_ <: Coprocessor]): Unit", "member" : "org.apache.hadoop.hbase.Coprocessor.stop", "link" : "org\/locationtech\/geomesa\/hbase\/server\/coprocessor\/GeoMesaCoprocessor.html#stop(x$1:org.apache.hadoop.hbase.CoprocessorEnvironment[_<:org.apache.hadoop.hbase.Coprocessor]):Unit", "kind" : "def"}, {"label" : "getResponsePrototype", "tail" : "(arg0: MethodDescriptor): Message", "member" : "org.locationtech.geomesa.hbase.proto.GeoMesaProto.GeoMesaCoprocessorService.getResponsePrototype", "link" : "org\/locationtech\/geomesa\/hbase\/server\/coprocessor\/GeoMesaCoprocessor.html#getResponsePrototype(x$1:com.google.protobuf.Descriptors.MethodDescriptor):com.google.protobuf.Message", "kind" : "final def"}, {"label" : "getRequestPrototype", "tail" : "(arg0: MethodDescriptor): Message", "member" : "org.locationtech.geomesa.hbase.proto.GeoMesaProto.GeoMesaCoprocessorService.getRequestPrototype", "link" : "org\/locationtech\/geomesa\/hbase\/server\/coprocessor\/GeoMesaCoprocessor.html#getRequestPrototype(x$1:com.google.protobuf.Descriptors.MethodDescriptor):com.google.protobuf.Message", "kind" : "final def"}, {"label" : "callMethod", "tail" : "(arg0: MethodDescriptor, arg1: RpcController, arg2: Message, arg3: RpcCallback[Message]): Unit", "member" : "org.locationtech.geomesa.hbase.proto.GeoMesaProto.GeoMesaCoprocessorService.callMethod", "link" : "org\/locationtech\/geomesa\/hbase\/server\/coprocessor\/GeoMesaCoprocessor.html#callMethod(x$1:com.google.protobuf.Descriptors.MethodDescriptor,x$2:com.google.protobuf.RpcController,x$3:com.google.protobuf.Message,x$4:com.google.protobuf.RpcCallback[com.google.protobuf.Message]):Unit", "kind" : "final def"}, {"label" : "getDescriptorForType", "tail" : "(): ServiceDescriptor", "member" : "org.locationtech.geomesa.hbase.proto.GeoMesaProto.GeoMesaCoprocessorService.getDescriptorForType", "link" : "org\/locationtech\/geomesa\/hbase\/server\/coprocessor\/GeoMesaCoprocessor.html#getDescriptorForType():com.google.protobuf.Descriptors.ServiceDescriptor", "kind" : "final def"}, {"label" : "synchronized", "tail" : "(arg0: ⇒ T0): T0", "member" : "scala.AnyRef.synchronized", "link" : "org\/locationtech\/geomesa\/hbase\/server\/coprocessor\/GeoMesaCoprocessor.html#synchronized[T0](x$1:=>T0):T0", "kind" : "final def"}, {"label" : "##", "tail" : "(): Int", "member" : "scala.AnyRef.##", "link" : "org\/locationtech\/geomesa\/hbase\/server\/coprocessor\/GeoMesaCoprocessor.html###():Int", "kind" : "final def"}, {"label" : "!=", "tail" : "(arg0: Any): Boolean", "member" : "scala.AnyRef.!=", "link" : "org\/locationtech\/geomesa\/hbase\/server\/coprocessor\/GeoMesaCoprocessor.html#!=(x$1:Any):Boolean", "kind" : "final def"}, {"label" : "==", "tail" : "(arg0: Any): Boolean", "member" : "scala.AnyRef.==", "link" : "org\/locationtech\/geomesa\/hbase\/server\/coprocessor\/GeoMesaCoprocessor.html#==(x$1:Any):Boolean", "kind" : "final def"}, {"label" : "ne", "tail" : "(arg0: AnyRef): Boolean", "member" : "scala.AnyRef.ne", "link" : "org\/locationtech\/geomesa\/hbase\/server\/coprocessor\/GeoMesaCoprocessor.html#ne(x$1:AnyRef):Boolean", "kind" : "final def"}, {"label" : "eq", "tail" : "(arg0: AnyRef): Boolean", "member" : "scala.AnyRef.eq", "link" : "org\/locationtech\/geomesa\/hbase\/server\/coprocessor\/GeoMesaCoprocessor.html#eq(x$1:AnyRef):Boolean", "kind" : "final def"}, {"label" : "finalize", "tail" : "(): Unit", "member" : "scala.AnyRef.finalize", "link" : "org\/locationtech\/geomesa\/hbase\/server\/coprocessor\/GeoMesaCoprocessor.html#finalize():Unit", "kind" : "def"}, {"label" : "wait", "tail" : "(arg0: Long, arg1: Int): Unit", "member" : "scala.AnyRef.wait", "link" : "org\/locationtech\/geomesa\/hbase\/server\/coprocessor\/GeoMesaCoprocessor.html#wait(x$1:Long,x$2:Int):Unit", "kind" : "final def"}, {"label" : "wait", "tail" : "(arg0: Long): Unit", "member" : "scala.AnyRef.wait", "link" : "org\/locationtech\/geomesa\/hbase\/server\/coprocessor\/GeoMesaCoprocessor.html#wait(x$1:Long):Unit", "kind" : "final def"}, {"label" : "wait", "tail" : "(): Unit", "member" : "scala.AnyRef.wait", "link" : "org\/locationtech\/geomesa\/hbase\/server\/coprocessor\/GeoMesaCoprocessor.html#wait():Unit", "kind" : "final def"}, {"label" : "notifyAll", "tail" : "(): Unit", "member" : "scala.AnyRef.notifyAll", "link" : "org\/locationtech\/geomesa\/hbase\/server\/coprocessor\/GeoMesaCoprocessor.html#notifyAll():Unit", "kind" : "final def"}, {"label" : "notify", "tail" : "(): Unit", "member" : "scala.AnyRef.notify", "link" : "org\/locationtech\/geomesa\/hbase\/server\/coprocessor\/GeoMesaCoprocessor.html#notify():Unit", "kind" : "final def"}, {"label" : "toString", "tail" : "(): String", "member" : "scala.AnyRef.toString", "link" : "org\/locationtech\/geomesa\/hbase\/server\/coprocessor\/GeoMesaCoprocessor.html#toString():String", "kind" : "def"}, {"label" : "clone", "tail" : "(): AnyRef", "member" : "scala.AnyRef.clone", "link" : "org\/locationtech\/geomesa\/hbase\/server\/coprocessor\/GeoMesaCoprocessor.html#clone():Object", "kind" : "def"}, {"label" : "equals", "tail" : "(arg0: Any): Boolean", "member" : "scala.AnyRef.equals", "link" : "org\/locationtech\/geomesa\/hbase\/server\/coprocessor\/GeoMesaCoprocessor.html#equals(x$1:Any):Boolean", "kind" : "def"}, {"label" : "hashCode", "tail" : "(): Int", "member" : "scala.AnyRef.hashCode", "link" : "org\/locationtech\/geomesa\/hbase\/server\/coprocessor\/GeoMesaCoprocessor.html#hashCode():Int", "kind" : "def"}, {"label" : "getClass", "tail" : "(): Class[_]", "member" : "scala.AnyRef.getClass", "link" : "org\/locationtech\/geomesa\/hbase\/server\/coprocessor\/GeoMesaCoprocessor.html#getClass():Class[_]", "kind" : "final def"}, {"label" : "asInstanceOf", "tail" : "(): T0", "member" : "scala.Any.asInstanceOf", "link" : "org\/locationtech\/geomesa\/hbase\/server\/coprocessor\/GeoMesaCoprocessor.html#asInstanceOf[T0]:T0", "kind" : "final def"}, {"label" : "isInstanceOf", "tail" : "(): Boolean", "member" : "scala.Any.isInstanceOf", "link" : "org\/locationtech\/geomesa\/hbase\/server\/coprocessor\/GeoMesaCoprocessor.html#isInstanceOf[T0]:Boolean", "kind" : "final def"}], "class" : "org\/locationtech\/geomesa\/hbase\/server\/coprocessor\/GeoMesaCoprocessor.html", "kind" : "class"}], "org.locationtech.geomesa.hbase" : [], "org" : []};